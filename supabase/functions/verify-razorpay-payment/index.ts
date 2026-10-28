import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {corsHeaders} from "../_shared/cors.ts";
const out=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders,"Content-Type":"application/json"}});
const hex=(b:ArrayBuffer)=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});if(req.method!=="POST")return out({error:"Method not allowed"},405);
 const secret=Deno.env.get("RAZORPAY_KEY_SECRET"),keyId=Deno.env.get("RAZORPAY_KEY_ID");if(!secret||!keyId)return out({error:"Payment verification not configured."},500);
 try{
  const b=await req.json(),{razorpay_order_id,razorpay_payment_id,razorpay_signature}=b;
  if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature)return out({error:"Incomplete payment response."},400);
  const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const expected=hex(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`)));
  if(expected!==String(razorpay_signature))return out({error:"Invalid payment signature."},400);
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:o,error:oe}=await admin.from("orders").select("id,order_number,subtotal_paise,status").eq("razorpay_order_id",razorpay_order_id).single();if(oe||!o)return out({error:"Order not found."},404);if(o.status==="paid")return out({success:true,order_number:o.order_number});
  const auth="Basic "+btoa(`${keyId}:${secret}`),pr=await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`,{headers:{Authorization:auth}}),p=await pr.json();
  if(!pr.ok||p.order_id!==razorpay_order_id||p.amount!==o.subtotal_paise||p.currency!=="INR"||!["authorized","captured"].includes(p.status))return out({error:"Payment could not be verified against order."},400);
  if(p.status==="authorized"){const cr=await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}/capture`,{method:"POST",headers:{Authorization:auth,"Content-Type":"application/json"},body:JSON.stringify({amount:o.subtotal_paise,currency:"INR"})});const cp=await cr.json();if(!cr.ok||cp.status!=="captured")return out({error:"Payment authorised but capture needs attention. Contact support."},409);}
  const {error:ue}=await admin.from("orders").update({status:"paid",payment_status:"paid",razorpay_payment_id,payment_verified_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",o.id).neq("status","paid");if(ue)throw ue;
  await admin.from("payment_events").insert({razorpay_order_id,razorpay_payment_id,event_type:"client_payment_verified",payload:{order_number:o.order_number}}); await admin.from("order_status_events").insert({order_id:o.id,status:"paid",description:"Payment confirmed",source:"payment",is_customer_visible:true});
  return out({success:true,order_number:o.order_number});
 }catch(e){console.error(e);return out({error:"Verification could not complete. Contact support before retrying."},500);}
});