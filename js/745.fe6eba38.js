"use strict";(self["webpackChunkleyasu"]=self["webpackChunkleyasu"]||[]).push([[745],{52054:function(e,o,t){t.d(o,{Q:function(){return $}});var i=t(11404),a=t(73396),l=t(44870),n=t(5323),s=t(12220),r=t(16491),c=t(96048),m=t(610);const[u,d,v]=(0,m["do"])("uploader");function p(e,o){return new Promise((t=>{if("file"===o)return void t();const i=new FileReader;i.onload=e=>{t(e.target.result)},"dataUrl"===o?i.readAsDataURL(e):"text"===o&&i.readAsText(e)}))}function g(e,o){return(0,s.qo)(e).some((e=>!!e.file&&((0,r.mf)(o)?o(e.file):e.file.size>o)))}function f(e,o){const t=[],i=[];return e.forEach((e=>{g(e,o)?i.push(e):t.push(e)})),{valid:t,invalid:i}}const h=/\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg)/i,w=e=>h.test(e);function y(e){return!!e.isImage||(e.file&&e.file.type?0===e.file.type.indexOf("image"):e.url?w(e.url):"string"===typeof e.content&&0===e.content.indexOf("data:image"))}var b=t(253),x=t(3444),W=t(13649),S=t(57548),C=t(19951),I=t(25322),z=t(47936),P=t(28620),Z=t(6305),F=t(65261),R=t(40003),k=t(12229),Y=t(28101);const X=e=>Math.sqrt((e[0].clientX-e[1].clientX)**2+(e[0].clientY-e[1].clientY)**2),O=(0,m["do"])("image-preview")[1];var A=(0,a.aZ)({props:{src:String,show:Boolean,active:Number,minZoom:(0,n.ir)(n.Or),maxZoom:(0,n.ir)(n.Or),rootWidth:(0,n.ir)(Number),rootHeight:(0,n.ir)(Number)},emits:["scale","close"],setup(e,{emit:o}){const t=(0,l.qj)({scale:1,moveX:0,moveY:0,moving:!1,zooming:!1,imageRatio:0,displayWidth:0,displayHeight:0}),i=(0,F.o)(),n=(0,a.Fl)((()=>{const{rootWidth:o,rootHeight:i}=e,a=i/o;return t.imageRatio>a})),s=(0,a.Fl)((()=>{const{scale:e,moveX:o,moveY:i,moving:a,zooming:l}=t,n={transitionDuration:l||a?"0s":".3s"};if(1!==e){const t=o/e,a=i/e;n.transform=`scale(${e}, ${e}) translate(${t}px, ${a}px)`}return n})),r=(0,a.Fl)((()=>{if(t.imageRatio){const{rootWidth:o,rootHeight:i}=e,a=n.value?i/t.imageRatio:o;return Math.max(0,(t.scale*a-o)/2)}return 0})),m=(0,a.Fl)((()=>{if(t.imageRatio){const{rootWidth:o,rootHeight:i}=e,a=n.value?i:o*t.imageRatio;return Math.max(0,(t.scale*a-i)/2)}return 0})),u=i=>{i=(0,c.uZ)(i,+e.minZoom,+e.maxZoom+1),i!==t.scale&&(t.scale=i,o("scale",{scale:i,index:e.active}))},d=()=>{u(1),t.moveX=0,t.moveY=0},v=()=>{const e=t.scale>1?1:2;u(e),t.moveX=0,t.moveY=0};let p,g,f,h,w,y,b;const x=e=>{const{touches:o}=e,{offsetX:a}=i;i.start(e),p=o.length,g=t.moveX,f=t.moveY,b=Date.now(),t.moving=1===p&&1!==t.scale,t.zooming=2===p&&!a.value,t.zooming&&(h=t.scale,w=X(e.touches))},W=e=>{const{touches:o}=e;if(i.move(e),(t.moving||t.zooming)&&(0,z.PF)(e,!0),t.moving){const{deltaX:e,deltaY:o}=i,a=e.value+g,l=o.value+f;t.moveX=(0,c.uZ)(a,-r.value,r.value),t.moveY=(0,c.uZ)(l,-m.value,m.value)}if(t.zooming&&2===o.length){const e=X(o),t=h*e/w;u(t)}},S=()=>{if(p>1)return;const{offsetX:e,offsetY:t}=i,a=Date.now()-b,l=250,n=5;e.value<n&&t.value<n&&a<l&&(y?(clearTimeout(y),y=null,v()):y=setTimeout((()=>{o("close"),y=null}),l))},C=o=>{let a=!1;(t.moving||t.zooming)&&(a=!0,t.moving&&g===t.moveX&&f===t.moveY&&(a=!1),o.touches.length||(t.zooming&&(t.moveX=(0,c.uZ)(t.moveX,-r.value,r.value),t.moveY=(0,c.uZ)(t.moveY,-m.value,m.value),t.zooming=!1),t.moving=!1,g=0,f=0,h=1,t.scale<1&&d(),t.scale>e.maxZoom&&(t.scale=+e.maxZoom))),(0,z.PF)(o,a),S(),i.reset()},I=e=>{const{naturalWidth:o,naturalHeight:i}=e.target;t.imageRatio=i/o};return(0,a.YP)((()=>e.active),d),(0,a.YP)((()=>e.show),(e=>{e||d()})),()=>{const o={loading:()=>(0,a.Wm)(k.g,{type:"spinner"},null)};return(0,a.Wm)(Y.j,{class:O("swipe-item"),onTouchstart:x,onTouchmove:W,onTouchend:C,onTouchcancel:C},{default:()=>[(0,a.Wm)(R.E,{src:e.src,fit:"contain",class:O("image",{vertical:n.value}),style:s.value,onLoad:I},o)]})}}});const[J,T]=(0,m["do"])("image-preview"),V=["show","transition","overlayStyle","closeOnPopstate"],H={show:Boolean,loop:n.J5,images:(0,n.Ce)(),minZoom:(0,n.SI)(1/3),maxZoom:(0,n.SI)(3),overlay:n.J5,closeable:Boolean,showIndex:n.J5,className:n.Vg,closeIcon:(0,n.SQ)("clear"),transition:String,beforeClose:Function,overlayClass:n.Vg,overlayStyle:Object,swipeDuration:(0,n.SI)(300),startPosition:(0,n.SI)(0),showIndicators:Boolean,closeOnPopstate:n.J5,closeIconPosition:(0,n.SQ)("top-right")};var j=(0,a.aZ)({name:J,props:H,emits:["scale","close","closed","change","update:show"],setup(e,{emit:o,slots:t}){const i=(0,l.iH)(),n=(0,l.qj)({active:0,rootWidth:0,rootHeight:0}),r=()=>{if(i.value){const e=(0,b.EL)(i.value.$el);n.rootWidth=e.width,n.rootHeight=e.height,i.value.resize()}},c=e=>o("scale",e),m=e=>o("update:show",e),u=()=>{(0,C.I)(e.beforeClose,{args:[n.active],done:()=>m(!1)})},d=e=>{e!==n.active&&(n.active=e,o("change",e))},v=()=>{if(e.showIndex)return(0,a.Wm)("div",{class:T("index")},[t.index?t.index({index:n.active}):`${n.active+1} / ${e.images.length}`])},p=()=>{if(t.cover)return(0,a.Wm)("div",{class:T("cover")},[t.cover()])},g=()=>(0,a.Wm)(P.o,{ref:i,lazyRender:!0,loop:e.loop,class:T("swipe"),duration:e.swipeDuration,initialSwipe:e.startPosition,showIndicators:e.showIndicators,indicatorColor:"white",onChange:d},{default:()=>[e.images.map((o=>(0,a.Wm)(A,{src:o,show:e.show,active:n.active,maxZoom:e.maxZoom,minZoom:e.minZoom,rootWidth:n.rootWidth,rootHeight:n.rootHeight,onScale:c,onClose:u},null)))]}),f=()=>{if(e.closeable)return(0,a.Wm)(W.J,{role:"button",name:e.closeIcon,class:[T("close-icon",e.closeIconPosition),I.e9],onClick:u},null)},h=()=>o("closed"),w=(e,o)=>{var t;return null==(t=i.value)?void 0:t.swipeTo(e,o)};return(0,x.F)({swipeTo:w}),(0,a.bv)(r),(0,a.YP)([z.bn,z.uK],r),(0,a.YP)((()=>e.startPosition),(e=>d(+e))),(0,a.YP)((()=>e.show),(t=>{const{images:i,startPosition:l}=e;t?(d(+l),(0,a.Y3)((()=>{r(),w(+l,{immediate:!0})}))):o("close",{index:n.active,url:i[n.active]})})),()=>(0,a.Wm)(Z.G,(0,a.dG)({class:[T(),e.className],overlayClass:[T("overlay"),e.overlayClass],onClosed:h,"onUpdate:show":m},(0,s.ei)(e,V)),{default:()=>[f(),g(),v(),p()]})}});let D;const L={loop:!0,images:[],maxZoom:3,minZoom:1/3,onScale:void 0,onClose:void 0,onChange:void 0,teleport:"body",className:"",showIndex:!0,closeable:!1,closeIcon:"clear",transition:void 0,beforeClose:void 0,overlayStyle:void 0,overlayClass:void 0,startPosition:0,swipeDuration:300,showIndicators:!1,closeOnPopstate:!0,closeIconPosition:"top-right"};function B(){({instance:D}=(0,S.H)({setup(){const{state:e,toggle:o}=(0,S.o)(),t=()=>{e.images=[]};return()=>(0,a.Wm)(j,(0,a.dG)(e,{onClosed:t,"onUpdate:show":o}),null)}}))}const U=(e,o=0)=>{if(s._f)return D||B(),e=Array.isArray(e)?{images:e,startPosition:o}:e,D.open((0,s.l7)({},L,e)),D};U.Component=(0,i.n)(j),U.install=e=>{e.use(U.Component)};var N=(0,a.aZ)({props:{name:n.Or,item:(0,n.ir)(Object),index:Number,imageFit:String,lazyLoad:Boolean,deletable:Boolean,previewSize:[Number,String,Array],beforeDelete:Function},emits:["delete","preview"],setup(e,{emit:o,slots:t}){const i=()=>{const{status:o,message:t}=e.item;if("uploading"===o||"failed"===o){const e="failed"===o?(0,a.Wm)(W.J,{name:"close",class:d("mask-icon")},null):(0,a.Wm)(k.g,{class:d("loading")},null),i=(0,r.Xq)(t)&&""!==t;return(0,a.Wm)("div",{class:d("mask")},[e,i&&(0,a.Wm)("div",{class:d("mask-message")},[t])])}},l=t=>{const{name:i,item:a,index:l,beforeDelete:n}=e;t.stopPropagation(),(0,C.I)(n,{args:[a,{name:i,index:l}],done:()=>o("delete")})},n=()=>o("preview"),m=()=>{if(e.deletable&&"uploading"!==e.item.status){const e=t["preview-delete"];return(0,a.Wm)("div",{role:"button",class:d("preview-delete",{shadow:!e}),tabindex:0,"aria-label":v("delete"),onClick:l},[e?e():(0,a.Wm)(W.J,{name:"cross",class:d("preview-delete-icon")},null)])}},u=()=>{if(t["preview-cover"]){const{index:o,item:i}=e;return(0,a.Wm)("div",{class:d("preview-cover")},[t["preview-cover"]((0,s.l7)({index:o},i))])}},p=()=>{const{item:o,lazyLoad:t,imageFit:i,previewSize:l}=e;return y(o)?(0,a.Wm)(R.E,{fit:i,src:o.content||o.url,class:d("preview-image"),width:Array.isArray(l)?l[0]:l,height:Array.isArray(l)?l[1]:l,lazyLoad:t,onClick:n},{default:u}):(0,a.Wm)("div",{class:d("file"),style:(0,c.Xn)(e.previewSize)},[(0,a.Wm)(W.J,{class:d("file-icon"),name:"description"},null),(0,a.Wm)("div",{class:[d("file-name"),"van-ellipsis"]},[o.file?o.file.name:o.url]),u()])};return()=>(0,a.Wm)("div",{class:d("preview")},[p(),i(),m()])}});const q={name:(0,n.SI)(""),accept:(0,n.SQ)("image/*"),capture:String,multiple:Boolean,disabled:Boolean,readonly:Boolean,lazyLoad:Boolean,maxCount:(0,n.SI)(1/0),imageFit:(0,n.SQ)("cover"),resultType:(0,n.SQ)("dataUrl"),uploadIcon:(0,n.SQ)("photograph"),uploadText:String,deletable:n.J5,afterRead:Function,showUpload:n.J5,modelValue:(0,n.Ce)(),beforeRead:Function,beforeDelete:Function,previewSize:[Number,String,Array],previewImage:n.J5,previewOptions:Object,previewFullImage:n.J5,maxSize:{type:[Number,String,Function],default:1/0}};var Q=(0,a.aZ)({name:u,props:q,emits:["delete","oversize","click-upload","close-preview","click-preview","update:modelValue"],setup(e,{emit:o,slots:t}){const i=(0,l.iH)(),n=[],m=(o=e.modelValue.length)=>({name:e.name,index:o}),u=()=>{i.value&&(i.value.value="")},v=t=>{if(u(),g(t,e.maxSize)){if(!Array.isArray(t))return void o("oversize",t,m());{const i=f(t,e.maxSize);if(t=i.valid,o("oversize",i.invalid,m()),!t.length)return}}t=(0,l.qj)(t),o("update:modelValue",[...e.modelValue,...(0,s.qo)(t)]),e.afterRead&&e.afterRead(t,m())},h=o=>{const{maxCount:t,modelValue:i,resultType:a}=e;if(Array.isArray(o)){const e=+t-i.length;o.length>e&&(o=o.slice(0,e)),Promise.all(o.map((e=>p(e,a)))).then((e=>{const t=o.map(((o,t)=>{const i={file:o,status:"",message:""};return e[t]&&(i.content=e[t]),i}));v(t)}))}else p(o,a).then((e=>{const t={file:o,status:"",message:""};e&&(t.content=e),v(t)}))},w=o=>{const{files:t}=o.target;if(e.disabled||!t||!t.length)return;const i=1===t.length?t[0]:[].slice.call(t);if(e.beforeRead){const o=e.beforeRead(i,m());if(!o)return void u();if((0,r.tI)(o))return void o.then((e=>{h(e||i)})).catch(u)}h(i)};let S;const C=()=>o("close-preview"),I=o=>{if(e.previewFullImage){const t=e.modelValue.filter(y),i=t.map((e=>(e.file&&!e.url&&"failed"!==e.status&&(e.url=URL.createObjectURL(e.file),n.push(e.url)),e.url))).filter(Boolean);S=U((0,s.l7)({images:i,startPosition:t.indexOf(o),onClose:C},e.previewOptions))}},z=()=>{S&&S.close()},P=(t,i)=>{const a=e.modelValue.slice(0);a.splice(i,1),o("update:modelValue",a),o("delete",t,m(i))},Z=(i,l)=>{const n=["imageFit","deletable","previewSize","beforeDelete"],r=(0,s.l7)((0,s.ei)(e,n),(0,s.ei)(i,n,!0));return(0,a.Wm)(N,(0,a.dG)({item:i,index:l,onClick:()=>o("click-preview",i,m(l)),onDelete:()=>P(i,l),onPreview:()=>I(i)},(0,s.ei)(e,["name","lazyLoad"]),r),(0,s.ei)(t,["preview-cover","preview-delete"]))},F=()=>{if(e.previewImage)return e.modelValue.map(Z)},R=e=>o("click-upload",e),k=()=>{if(e.modelValue.length>=e.maxCount||!e.showUpload)return;const o=e.readonly?null:(0,a.Wm)("input",{ref:i,type:"file",class:d("input"),accept:e.accept,capture:e.capture,multiple:e.multiple,disabled:e.disabled,onChange:w},null);return t.default?(0,a.Wm)("div",{class:d("input-wrapper"),onClick:R},[t.default(),o]):(0,a.Wm)("div",{class:d("upload",{readonly:e.readonly}),style:(0,c.Xn)(e.previewSize),onClick:R},[(0,a.Wm)(W.J,{name:e.uploadIcon,class:d("upload-icon")},null),e.uploadText&&(0,a.Wm)("span",{class:d("upload-text")},[e.uploadText]),o])},Y=()=>{i.value&&!e.disabled&&i.value.click()};return(0,a.Jd)((()=>{n.forEach((e=>URL.revokeObjectURL(e)))})),(0,x.F)({chooseFile:Y,closeImagePreview:z}),(0,b.aM)((()=>e.modelValue)),()=>(0,a.Wm)("div",{class:d()},[(0,a.Wm)("div",{class:d("wrapper",{disabled:e.disabled})},[F(),k()])])}});const $=(0,i.n)(Q)},59841:function(e,o,t){t(31958),t(20368),t(56742),t(57179),t(62939),t(76196),t(22666)}}]);
//# sourceMappingURL=745.fe6eba38.js.map