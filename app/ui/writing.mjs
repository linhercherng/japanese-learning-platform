/** Canvas strokes use normalized coordinates, preserving drawings across resize. */
export function attachWriting(canvas,initialPoints,onChange){
 let strokes=structuredClone(initialPoints||[]),pointer=null;
 function redraw(){const size=canvas.getBoundingClientRect().width,ratio=devicePixelRatio||1;canvas.width=Math.round(size*ratio);canvas.height=Math.round(size*ratio);const c=canvas.getContext('2d');c.scale(ratio,ratio);c.strokeStyle='#455f4e';c.fillStyle='#455f4e';c.lineWidth=3.5;c.lineCap='round';c.lineJoin='round';for(const points of strokes){if(points.length===1){c.beginPath();c.arc(points[0].x*size,points[0].y*size,1.75,0,Math.PI*2);c.fill();continue;}c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x*size,p.y*size):c.moveTo(p.x*size,p.y*size));c.stroke();}}
 const point=event=>{const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(event.clientY-r.top)/r.height))};};
 canvas.addEventListener('pointerdown',event=>{if(event.button!==0||pointer!==null||strokes.length>=30)return;pointer=event.pointerId;canvas.setPointerCapture(pointer);strokes.push([point(event)]);redraw();});
 canvas.addEventListener('pointermove',event=>{if(pointer!==event.pointerId)return;const last=strokes.at(-1);if(last.length<1000)last.push(point(event));redraw();});
 const stop=event=>{if(pointer!==event.pointerId)return;pointer=null;onChange(structuredClone(strokes));};
 ['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,stop));
 const observer=new ResizeObserver(redraw);observer.observe(canvas);redraw();
 return {points:()=>structuredClone(strokes),undo:()=>{strokes.pop();redraw();onChange(structuredClone(strokes));},clear:()=>{strokes=[];redraw();onChange([]);},dispose:()=>{if(pointer!==null)onChange(structuredClone(strokes));observer.disconnect();}};
}
