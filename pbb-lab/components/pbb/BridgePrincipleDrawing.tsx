/** Original vector illustration informed by the supplied side-elevation references. Not to scale. */
export default function BridgePrincipleDrawing(){
 return <svg viewBox="0 0 1000 500" aria-hidden="true" focusable="false">
  <defs>
   <pattern id="a-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#294953" strokeWidth=".6"/></pattern>
   <linearGradient id="a-pane" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#558c98"/><stop offset="1" stopColor="#224d5d"/></linearGradient>
   <linearGradient id="a-metal" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#769499"/><stop offset=".45" stopColor="#d4ded7"/><stop offset="1" stopColor="#69898f"/></linearGradient>
  </defs>
  <rect width="1000" height="500" fill="url(#a-grid)"/>
  <path d="M65 451H956" stroke="#719197" strokeWidth="1"/>
  <path d="M95 445L205 430 930 434 896 455 115 455Z" fill="#061d29" opacity=".7"/>
  {/* Fixed terminal link is separate from the rotunda. */}
  <g stroke="#627e86" strokeWidth="1.5"><path d="M30 157L75 142V310L30 325Z" fill="#153440"/><path d="M75 193L126 187V285L75 291Z" fill="#325360"/><path d="M75 193L90 181 140 175 126 187Z" fill="#789095"/><path d="M88 206H123V272H88Z" fill="url(#a-pane)"/></g>
  <g className="a-svg-rotunda" stroke="#a5bfc0" strokeWidth="1.5">
   <path d="M129 290V426H150V290" fill="url(#a-metal)"/>
   <path d="M134 335H145V423H134Z" fill="#466874"/>
   <path d="M116 425H161L170 440H107Z" fill="#7a969a"/>
   <ellipse cx="146" cy="192" rx="40" ry="13" fill="#c8d5d1"/>
   <path d="M106 192V282Q146 307 186 282V192Q146 216 106 192Z" fill="url(#a-metal)"/>
   <path d="M110 198V278m7 -75v79m8 -76v80m8 -77v80m9 -77v79m9 -80v79m9 -81v80m9 -84v81m8 -85v81" stroke="#5f7e86" strokeWidth="1"/>
   <ellipse cx="146" cy="282" rx="40" ry="13" fill="none"/>
   <path d="M184 201H213V282H184Z" fill="#4f707b"/>
   <path d="M188 205V279m6 -74v74m6 -74v74m6 -74v74" stroke="#afc1bd"/>
  </g>
  {/* Three telescoping shells, each with its own roof, sill and glazed truss. */}
  <g className="a-svg-tunnel" strokeLinejoin="round">
   {[{x:210,end:459,y:191,bottom:286},{x:443,end:668,y:184,bottom:293},{x:650,end:829,y:177,bottom:300}].map((t,index)=><g key={t.x}>
    <path d={`M${t.x} ${t.y}L${t.x+14} ${t.y-12}H${t.end+14}L${t.end} ${t.y}Z`} fill="#b9cac7" stroke="#d0ded7" strokeWidth="1.5"/>
    <path d={`M${t.x} ${t.y}H${t.end}V${t.bottom}H${t.x}Z`} fill="url(#a-pane)" stroke="#b9cfcc" strokeWidth="2"/>
    <path d={`M${t.x} ${t.y+9}H${t.end}M${t.x} ${t.bottom-10}H${t.end}`} stroke="#9ebbbb" fill="none"/>
    {Array.from({length:Math.floor((t.end-t.x)/33)},(_,i)=>{const x=t.x+9+i*33;return <g key={x} stroke="#a3c2c1" fill="none"><path d={`M${x} ${t.y+9}V${t.bottom-10}M${x} ${t.bottom-10}L${x+28} ${t.y+9}M${x+5} ${t.bottom-10}L${x+32} ${t.y+9}`} strokeWidth="1.4"/></g>;})}
    <path d={`M${t.x} ${t.bottom}H${t.end}V${t.bottom+7}H${t.x}Z`} fill="#a9bdbb" stroke="#d3dfd6"/>
    <path d={`M${t.x} ${t.y}V${t.bottom+7}`} stroke="#d6dfd7" strokeWidth="8"/>
    <path d={`M${t.end} ${t.y}V${t.bottom+7}`} stroke="#c1d1cb" strokeWidth="7"/>
    <text x={(t.x+t.end)/2} y={t.y-30} textAnchor="middle" fontSize="10" fill="#9dbabf" letterSpacing="2">ỐNG LỒNG {['A','B','C'][index]}</text>
   </g>)}
   <path d="M245 300H623L643 309H800" fill="none" stroke="#4e737d" strokeWidth="7"/>
   <path d="M265 304H600M678 314H794" fill="none" stroke="#b4c8c4" strokeWidth="2"/>
  </g>
  {/* Two nested lift posts with the axle underneath, supporting the outer tunnel. */}
  <g className="a-svg-lift" stroke="#b5cbc7" strokeWidth="1.5">
   <path d="M636 153H655V351H636Z" fill="url(#a-metal)"/><path d="M680 145H699V347H680Z" fill="url(#a-metal)"/>
   <path d="M641 352H651V413H641ZM685 348H695V413H685Z" fill="#92b0b4"/>
   <path d="M633 332H658V347H633ZM677 329H702V344H677Z" fill="#365a66"/>
   <path d="M642 361V404m46 -48v48" stroke="#d3ded0" strokeDasharray="3 3"/>
   <path d="M633 406H704V422H633Z" fill="#73949a"/>
   <path d="M657 310H678V333H657Z" fill="#284b58"/>
  </g>
  <g className="a-svg-wheels" stroke="#90aeb0" strokeWidth="1.5">
   <path d="M626 419H711V434H626Z" fill="#4a6c77"/>
   {[642,694].map(x=><g key={x}><ellipse cx={x} cy="433" rx="16" ry="20" fill="#081d29" stroke="#41616c" strokeWidth="5"/><ellipse cx={x} cy="433" rx="7" ry="10" fill="#97afb0"/><circle cx={x} cy="433" r="3" fill="#274753"/></g>)}
   <path d="M617 421V444H720V420" stroke="#cfba7d" strokeWidth="3" fill="none"/>
  </g>
  {/* Service stairs and small under-tunnel equipment are contextual illustration. */}
  <g strokeLinejoin="round"><path d="M809 307L717 443H736L827 307Z" fill="#41616c" stroke="#a9c0bf" strokeWidth="1.5"/>
   {Array.from({length:15},(_,i)=>{const x=808-i*6.1,y=313+i*8.7;return <path key={i} d={`M${x} ${y}h17`} stroke="#b6c9c3" strokeWidth="2"/>;})}
   <path d="M804 278L697 435M833 278L727 435M804 278H833M697 435H727" fill="none" stroke="#c4d1ca" strokeWidth="2"/>
   {[0,1,2,3,4,5].map(i=><path key={i} d={`M${804-i*20} ${279+i*29}v26M${831-i*20} ${279+i*29}v26`} fill="none" stroke="#99b4b5" strokeWidth="1.3"/>)}
   <path d="M780 299V267H825V299M782 267V249H824V267" fill="none" stroke="#9db8b8" strokeWidth="1.5"/>
   <path d="M516 306V318M580 307V318" stroke="#91b1b4" strokeWidth="2" fill="none"/><path d="M502 318H595V355H502Z" fill="#365968" stroke="#91b1b4"/><path d="M509 325H546V348H509ZM553 325H587V348H553Z" fill="#173d4b" stroke="#597e87"/>
  </g>
  <g className="a-svg-cabin" stroke="#b6cdca" strokeWidth="1.5">
   <path d="M830 183L845 170H902L887 183Z" fill="#d0dbd1"/>
   <path d="M830 183H887V305H830Z" fill="url(#a-metal)"/>
   <path d="M840 197H872V266H840Z" fill="#214958" stroke="#d0ddd2"/>
   <path d="M844 202H868V259H844Z" fill="url(#a-pane)"/>
   <path d="M845 226H867M857 202V259" stroke="#a8c4c0"/>
   <path d="M840 278H873V294H840Z" fill="#597d84"/>
   <path d="M887 183L902 170V291L887 305Z" fill="#7a9a9d"/>
  </g>
  <g className="a-svg-canopy" stroke="#b6c9c3" strokeWidth="1.5">
   <path d="M890 185L918 177 944 189V294L918 306 890 303Z" fill="#9cb2af"/>
   <path d="M917 183L938 193V289L917 299Z" fill="#173744"/>
   <path d="M894 190V299m5 -110v109m5 -111v109m5 -110v108" fill="none" stroke="#466773" strokeWidth="2"/>
   <path d="M921 195L933 201V281L921 288Z" fill="#254a56" stroke="#7a9d9f"/>
  </g>
  <path className="a-svg-bumper" d="M915 303L945 291" stroke="#ddc28a" strokeWidth="10" strokeLinecap="round"/>
  <g fill="none" stroke="#b6a376" strokeWidth="1" opacity=".8"><path d="M214 118H814M214 113V123M814 113V123"/><path d="M588 377V424M583 377H593M583 424H593"/></g>
  <path d="M920 150V197" stroke="#8eafb4" strokeWidth="1" strokeDasharray="3 4" fill="none"/><g fill="#88a8ae" fontSize="9" letterSpacing="1.8"><text x="77" y="480">PHÍA NHÀ GA</text><text x="730" y="480">PHÍA TÀU BAY →</text></g>
 </svg>;
}
