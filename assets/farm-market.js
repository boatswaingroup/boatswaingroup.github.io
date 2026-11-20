const marketAssets = [
  { id:'cattle', name:'Cattle', stock:4, price:120, history:[] },
  { id:'chickens', name:'Chickens', stock:20, price:18, history:[] },
  { id:'horses', name:'Horses', stock:3, price:245, history:[] },
  { id:'fish', name:'Fish', stock:100, price:4.5, history:[] }
];
const marketCashStart = 10000;
let marketCash = marketCashStart;
const marketHoldings = Object.fromEntries(marketAssets.map(asset=>[asset.id,0]));
const marketTrades = [];
const marketNodes = new Map();
const money = value => `${Number(value).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})} pts`;
const make = (tag,cls,text) => {const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};

function initFarmMarket(){
  const root=document.getElementById('farmMarketAssets');
  if(!root)return;
  for(const asset of marketAssets){
    asset.history=Array.from({length:18},(_,i)=>asset.price*(.97+i*.0018));
    const card=make('article','market-asset');
    card.append(make('h3','',asset.name));
    card.append(make('div','market-stock',`Demo stock: ${asset.stock} units`));
    const price=make('div','market-price',money(asset.price));
    const change=make('div','market-change','0.00%');
    const chart=document.createElementNS('http://www.w3.org/2000/svg','svg');
    chart.setAttribute('viewBox','0 0 180 44');chart.setAttribute('class','market-chart');chart.setAttribute('role','img');chart.setAttribute('aria-label',asset.name+' simulated price trend');
    const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');chart.append(line);
    const order=make('div','market-order');
    const quantity=document.createElement('input');quantity.type='number';quantity.min='1';quantity.step='1';quantity.value='1';quantity.setAttribute('aria-label',asset.name+' trade quantity');
    const buy=make('button','market-buy','Buy');
    const sell=make('button','market-sell','Sell');
    buy.type='button';sell.type='button';
    buy.addEventListener('click',()=>executeTrade(asset,'BUY',quantity.value));
    sell.addEventListener('click',()=>executeTrade(asset,'SELL',quantity.value));
    order.append(quantity,buy,sell);
    card.append(price,change,chart,order);root.append(card);
    marketNodes.set(asset.id,{card,price,change,line,stock:card.querySelector('.market-stock')});
    updateChart(asset);
  }
  renderPortfolio();
  document.getElementById('marketMessage').textContent='Choose an asset and quantity. All orders here are simulated with demo points.';
}

function updateChart(asset){
  const nodes=marketNodes.get(asset.id);if(!nodes)return;
  const min=Math.min(...asset.history),max=Math.max(...asset.history),span=max-min||1;
  const points=asset.history.map((v,i)=>`${(i/(asset.history.length-1))*180},${40-((v-min)/span)*34}`).join(' ');
  nodes.line.setAttribute('points',points);
}
function renderPortfolio(){
  const cash=document.getElementById('marketCash');
  if(cash)cash.textContent=money(marketCash);
  const holdings=document.getElementById('marketHoldings');
  const active=marketAssets.filter(a=>marketHoldings[a.id]>0).map(a=>`${a.name}: ${marketHoldings[a.id]}`);
  if(holdings)holdings.textContent=active.length?active.join(' · '):'No holdings yet';
  const tbody=document.getElementById('marketTradeHistory');
  if(!tbody)return;
  tbody.replaceChildren();
  if(!marketTrades.length){const row=tbody.insertRow();const cell=row.insertCell();cell.colSpan=6;cell.className='market-empty';cell.textContent='Your demo trades will appear here.';return;}
  for(const trade of marketTrades.slice(0,8)){
    const row=tbody.insertRow();
    for(const value of [trade.time,trade.asset,trade.side,trade.quantity,money(trade.price),money(trade.total)]){
      row.insertCell().textContent=value;
    }
  }
}
function executeTrade(asset,side,rawQuantity){
  const quantity=Number(rawQuantity);
  const message=document.getElementById('marketMessage');
  if(!Number.isSafeInteger(quantity)||quantity<1){message.textContent='Enter a whole-number quantity of at least 1.';return;}
  const total=asset.price*quantity;
  if(side==='BUY'){
    if(quantity>asset.stock){message.textContent=`Only ${asset.stock} ${asset.name.toLowerCase()} units are in the demonstration stock.`;return;}
    if(total>marketCash){message.textContent='Your paper wallet does not have enough demo points for this order.';return;}
    marketCash-=total;asset.stock-=quantity;marketHoldings[asset.id]+=quantity;
  }else{
    if(quantity>marketHoldings[asset.id]){message.textContent=`Your paper portfolio holds only ${marketHoldings[asset.id]} ${asset.name.toLowerCase()} units.`;return;}
    marketCash+=total;asset.stock+=quantity;marketHoldings[asset.id]-=quantity;
  }
  marketTrades.unshift({time:new Intl.DateTimeFormat('en-NG',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date()),asset:asset.name,side,quantity,price:asset.price,total});
  marketMessage.textContent=`Paper ${side.toLowerCase()} filled: ${quantity} ${asset.name.toLowerCase()} at ${money(asset.price)} each.`;
  const nodes=marketNodes.get(asset.id);nodes.stock.textContent=`Demo stock: ${asset.stock} units`;
  renderPortfolio();
}
const marketMessage=document.getElementById('marketMessage');
initFarmMarket();
window.setInterval(()=>{
  for(const asset of marketAssets){
    const previous=asset.price;
    asset.price=Math.max(.1,asset.price*(1+(Math.random()-.49)*.018));
    asset.history.push(asset.price);if(asset.history.length>24)asset.history.shift();
    const nodes=marketNodes.get(asset.id);if(!nodes)continue;
    nodes.price.textContent=money(asset.price);
    const percent=((asset.price-previous)/previous)*100;
    nodes.change.textContent=`${percent>=0?'+':''}${percent.toFixed(2)}% this tick`;
    nodes.change.style.color=percent>=0?'#18734d':'#b34b3f';
    updateChart(asset);
  }
},3000);
