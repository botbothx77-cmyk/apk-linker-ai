import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const $ = (id) => document.getElementById(id);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentProfile = null;

function message(id, text, good=false) {
  const el=$(id); el.textContent=text; el.style.color=good?"#79e0ad":"#ffc66d";
}
function showLoggedIn(profile) {
  currentProfile=profile;
  $("login").hidden=true; $("app").hidden=false;
  $("welcome").textContent="مرحبا بك";
  $("roleText").textContent=profile.role==="admin"?"Admin — المالك":"Sub Admin — مسؤول فرعي";
  $("adminsPanel").hidden=profile.role!=="admin";
  $("createLicensePanel").hidden=profile.role!=="admin" && !profile.permissions?.create_licenses;
  loadLicenses();
}
async function loadProfile(user) {
  const {data,error}=await supabase.from("profiles").select("id,email,role,permissions").eq("id",user.id).single();
  if(error) throw error;
  showLoggedIn(data);
}
async function loadLicenses() {
  const {data,error}=await supabase.from("licenses").select("code,status,expires_at,max_devices").order("created_at",{ascending:false}).limit(100);
  if(error){$("licenseRows").innerHTML=`<tr><td colspan="4">تعذر تحميل الأكواد: ${escapeHtml(error.message)}</td></tr>`;return;}
  $("totalCodes").textContent=data.length;
  $("activeCodes").textContent=data.filter(x=>x.status==="active" && new Date(x.expires_at)>new Date()).length;
  $("licenseRows").innerHTML=data.map(x=>`<tr><td dir="ltr">${escapeHtml(x.code)}</td><td>${x.status==="active"?"نشط":"موقوف"}</td><td>${new Date(x.expires_at).toLocaleString("ar")}</td><td>${x.max_devices}</td></tr>`).join("") || '<tr><td colspan="4">لا توجد أكواد بعد</td></tr>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

$("loginBtn").addEventListener("click",async()=>{
  message("loginMsg","جارٍ تسجيل الدخول...");
  const {data,error}=await supabase.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  if(error){message("loginMsg",error.message);return;}
  try{await loadProfile(data.user);}catch(e){message("loginMsg","تم الدخول لكن الحساب غير مهيأ: "+e.message);}
});
$("logoutBtn").addEventListener("click",async()=>{await supabase.auth.signOut();currentProfile=null;$("app").hidden=true;$("login").hidden=false;});
$("refreshBtn").addEventListener("click",loadLicenses);
$("createLicenseBtn").addEventListener("click",async()=>{
  message("licenseMsg","جارٍ إنشاء الكود...");
  const days=Number($("duration").value), devices=Number($("devices").value);
  if(!Number.isInteger(days)||days<1||days>3650||!Number.isInteger(devices)||devices<1||devices>20){message("licenseMsg","تحقق من المدة وعدد الأجهزة.");return;}
  const {data,error}=await supabase.functions.invoke("manage-license",{body:{action:"create",duration_days:days,max_devices:devices}});
  if(error){message("licenseMsg",error.message);return;}
  if(!data?.code){message("licenseMsg",data?.message||"تعذر إنشاء الكود.");return;}
  $("newCode").hidden=false;$("newCode").textContent=data.code;
  message("licenseMsg","تم إنشاء الكود بنجاح.",true);loadLicenses();
});
$("createAdminBtn").addEventListener("click",async()=>{
  message("adminMsg","جارٍ إنشاء الحساب...");
  const email=$("adminEmail").value.trim(),password=$("adminPassword").value;
  if(!email||password.length<8){message("adminMsg","أدخل بريداً صحيحاً وكلمة مرور من 8 أحرف على الأقل.");return;}
  const {data,error}=await supabase.functions.invoke("create-admin",{body:{email,password,permissions:{create_licenses:$("canCreate").checked}}});
  if(error){message("adminMsg",error.message);return;}
  message("adminMsg",data?.message||"تم إنشاء المسؤول.",!data?.error);
});
const {data:{session}}=await supabase.auth.getSession();
if(session){try{await loadProfile(session.user);}catch(e){message("loginMsg","الحساب غير مهيأ بعد: "+e.message);}}
