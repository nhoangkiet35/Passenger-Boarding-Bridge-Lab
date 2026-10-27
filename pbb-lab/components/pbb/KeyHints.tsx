import './key-hints.css';

export function Keycap({children}:{children:string}) {
 return <kbd className="ops-keycap">{children}</kbd>;
}

/** Format only known key instructions; equipment names and “ống A” remain normal text. */
export default function KeyHints({text}:{text:string}) {
 const tokens=text.split(/(?<![\p{L}\p{N}_])(WASD|W\s*\/\s*S|A\s*\/\s*D|R\s*\/\s*F|Q\s*\/\s*Z|Esc|Tab|E|F|V)(?![\p{L}\p{N}_])/gu);
 return <>{tokens.map((token,i)=>{
  if(i%2===0)return token;
  const keys=token==='WASD'?token.split(''):token.includes('/')?token.split(/\s*\/\s*/):[token];
  return <span className="ops-keygroup" key={i}>{keys.map((key,j)=><span className="ops-keyitem" key={key}>{j>0&&token!=='WASD'&&<span className="ops-keyseparator">/</span>}<Keycap>{key}</Keycap></span>)}</span>;
 })}</>;
}
