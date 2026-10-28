import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {corsHeaders} from "../_shared/cors.ts";
const out=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders,"Content-Type":"application/json"}});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders}); if(req.method!=="POST")return out({error:"Method not allowed"},405);
 const keyId=Deno.env.get("RAZORPAY_KEY_ID"),secret=Deno.env.get("RAZORPAY_KEY_SECRET");
 if(!keyId||!secret)return out({error:"Razorpay is not configured."},500);
 try{
  const b=await req.json(),c=b.customer,items=b.items;
  let userId=null; const auth=req.headers.get("Authorization"); if(auth){ const anon=Deno.env.get("SUPABASE_ANON_KEY"); if(anon){ const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2"); const uc=createClient(Deno.env.get("SUPABASE_URL")!,anon,{global:{headers:{Authorization:auth}}}); const {data:{user}}=await uc.auth.getUser(); if(user)userId=user.id; }}
  if(!c?.name||!c?.email||!c?.phone||!c?.address||!c?.city||!c?.pincode)return out({error:"Complete delivery details are required."},400);
  if(!Array.isArray(items)||items.length<1||items.length>30)return out({error:"Invalid cart."},400);
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const ids=[...new Set(items.map((i:any)=>String(i.product_id)))];
  const {data:ps,error:pe}=await admin.from("products").select("id,slug,name,price_inr,colors,is_active,inventory_count").in("id",ids);
  if(pe)throw pe;if(!ps||ps.length!==ids.length)return out({error:"Product unavailable."},400);
  let total=0;const normalized=[];
  for(const i of items){const p=ps.find((x:any)=>x.id===String(i.product_id)),q=Number(i.quantity),color=String(i.color||"Ivory");if(!p||!p.is_active||!Number.isInteger(q)||q<1||q>10)return out({error:"Invalid product or quantity."},400);if(p.inventory_count<q)return out({error:`${p.name} is out of stock.`},400);if(p.colors?.length&&!p.colors.includes(color))return out({error:"Selected colour unavailable."},400);total+=p.price_inr*100*q;normalized.push({product_id:p.id,product_slug:p.slug,product_name:p.name,color,unit_price_paise:p.price_inr*100,quantity:q});}
  const rpRes=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{Authorization:"Basic "+btoa(`${keyId}:${secret}`),"Content-Type":"application/json"},body:JSON.stringify({amount:total,currency:"INR",receipt:"umbre_"+crypto.randomUUID().slice(0,20)})});
  const rp=await rpRes.json();if(!rpRes.ok)return out({error:rp?.error?.description||"Razorpay order creation failed."},502);
  const number="LM-"+new Date().getFullYear()+"-"+crypto.randomUUID().slice(0,8).toUpperCase();
  const {data:o,error:oe}=await admin.from("orders").insert({order_number:number,user_id:userId,customer_name:String(c.name).slice(0,120),customer_email:String(c.email).slice(0,254),customer_phone:String(c.phone).slice(0,30),shipping_address:String(c.address).slice(0,500),shipping_address2:String(c.address2||"").slice(0,300),shipping_landmark:String(c.landmark||"").slice(0,200),shipping_city:String(c.city).slice(0,120),shipping_state:String(c.state||"").slice(0,120),shipping_pincode:String(c.pincode).slice(0,20),subtotal_paise:total,shipping_paise:0,tax_paise:0,total_paise:total,status:"pending_payment",payment_status:"pending",razorpay_order_id:rp.id}).select("id,order_number").single();
  if(oe)throw oe;const {error:ie}=await admin.from("order_items").insert(normalized.map(i=>({...i,order_id:o.id})));if(ie)throw ie; await admin.from("order_status_events").insert({order_id:o.id,status:"pending_payment",description:"Order placed; awaiting payment",source:"system",is_customer_visible:true});
  return out({order_id:rp.id,key_id:keyId,amount:total,currency:"INR",order_number:o.order_number});
 }catch(e){console.error(e);return out({error:"Unable to prepare checkout."},500);}
});