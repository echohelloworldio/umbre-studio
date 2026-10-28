const im=id=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;
export const categories=['All lamps','Table lamps','Bedside lamps','Sculptural','Floor lamps','Pendant lights','Wall lights'];
const raw=[
['nova-table','Nova Table Lamp','Table lamps',5499,'Bestseller','mushroom','Ivory,Terracotta,Olive','photo-1507473885765-e6ed057f782c'],
['drift','Drift Sculptural Lamp','Sculptural',5999,'New','twist','Ivory,Clay,Midnight','photo-1543198126-a8ad8e47fb22'],
['astra-bedside','Astra Bedside Lamp','Bedside lamps',4999,'','dome','Sand,Ivory,Sage','photo-1513506003901-1e6a229e2d15'],
['flow-column','Flow Column Lamp','Sculptural',6499,'','column','Ivory,Amber,Olive','photo-1543198126-a8ad8e47fb22'],
['halo-mini','Halo Mini Lamp','Table lamps',4499,'','geo','Warm White,Clay,Olive','photo-1507473885765-e6ed057f782c'],
['arc-pendant','Arc Pendant Light','Pendant lights',8999,'','arc','Ivory,Sand,Midnight','photo-1513506003901-1e6a229e2d15'],
['solstice-floor','Solstice Floor Lamp','Floor lamps',12999,'Statement','floor','Ivory,Olive,Clay','photo-1507473885765-e6ed057f782c'],
['orbit-bedside','Orbit Bedside Lamp','Bedside lamps',5299,'','orb','Ivory,Terracotta,Sand','photo-1513506003901-1e6a229e2d15'],
['ripple-table','Ripple Table Lamp','Table lamps',5799,'','ripple','Ivory,Sage,Midnight','photo-1507473885765-e6ed057f782c'],
['form-no-01','Form No. 01','Sculptural',6999,'Limited form','form','Ivory,Clay,Olive','photo-1543198126-a8ad8e47fb22'],
['luna-wall','Luna Wall Light','Wall lights',3999,'','wall','Ivory,Sand,Terracotta','photo-1513506003901-1e6a229e2d15'],
['petal-pendant','Petal Pendant','Pendant lights',9999,'','petal','Ivory,Sand,Olive','photo-1513506003901-1e6a229e2d15'],
['cove-bedside','Cove Bedside Lamp','Bedside lamps',4799,'','cove','Sand,Ivory,Sage','photo-1507473885765-e6ed057f782c'],
['column-mini','Column Mini','Table lamps',4299,'','column','Ivory,Terracotta,Midnight','photo-1543198126-a8ad8e47fb22'],
['arc-reading','Arc Reading Floor Lamp','Floor lamps',14999,'Studio pick','floor','Ivory,Midnight,Olive','photo-1507473885765-e6ed057f782c'],
['line-wall','Line Wall Light','Wall lights',3599,'','wall','Ivory,Clay,Midnight','photo-1513506003901-1e6a229e2d15'],
['sol-table','Sol Table Lamp','Table lamps',6199,'','dome','Ivory,Sand,Olive','photo-1507473885765-e6ed057f782c'],
['helix-sculpture','Helix Sculptural Lamp','Sculptural',7499,'','twist','Ivory,Terracotta,Midnight','photo-1543198126-a8ad8e47fb22'],
['dune-pendant','Dune Pendant','Pendant lights',8499,'','geo','Sand,Ivory,Clay','photo-1513506003901-1e6a229e2d15'],
['ember-bedside','Ember Bedside Lamp','Bedside lamps',5199,'New','mushroom','Terracotta,Ivory,Olive','photo-1507473885765-e6ed057f782c'],
['arc-wall','Arc Wall Light','Wall lights',4299,'','wall','Ivory,Sand,Midnight','photo-1513506003901-1e6a229e2d15'],
['studio-pendant','Studio Pendant','Pendant lights',10999,'','petal','Ivory,Olive,Clay','photo-1513506003901-1e6a229e2d15']
];
const halo={
 id:'the-halo',slug:'the-halo',name:'The Halo Sculptural Table Lamp',category:'Table lamps',price:1999,tag:'First design',shape:'halo',
 colors:['Ivory','Sage Green','Terracotta','Charcoal Black'],
 dimensions:'Approx. 200 mm shade diameter × 260 mm total height',
 description:'A sculptural table lamp with a softly domed, finely fluted shade and a flowing twisted pedestal. The Halo is Umbre Studio’s first original 3D-printable lamp concept, designed to bring warm ambient light and tactile form to bedside tables, reading corners and living spaces.',
 image:'/product-images/halo-hero.webp',
 gallery:[
  {src:'/product-images/halo-hero.webp',alt:'The Halo lamp in ivory, front studio view'},
  {src:'/product-images/halo-lifestyle.webp',alt:'The Halo lamp glowing on a bedside table'},
  {src:'/product-images/halo-detail.webp',alt:'Close-up of the Halo lamp fluted shade and twisted base'},
  {src:'/product-images/halo-design-board.webp',alt:'The Halo design board with views, colour concepts and dimensions'}
 ],
 details:{shade:'Approx. 200 mm diameter',height:'Approx. 260 mm',base:'Approx. 110 mm diameter',material:'PLA prototype; final material and heat clearances require validation',bulb:'Replaceable low-wattage LED only; holder fit must be confirmed',cord:'Rear/underside cable routing is part of the prototype CAD direction',status:'Prototype concept — not yet safety-certified'}
};
export const products=[halo,...raw.map(([id,name,category,price,tag,shape,colors,photo])=>({id,slug:id,name,category,price,tag,shape,colors:colors.split(','),dimensions:category==='Floor lamps'?'38 × 38 × 145 cm':'24 × 24 × 29 cm',description:`A thoughtfully shaped ${category.toLowerCase().replace(/s$/,'')} with tactile surfaces and a soft, considered glow. Designed to bring warmth and character to everyday spaces.`,image:im(photo)}))];
export const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
