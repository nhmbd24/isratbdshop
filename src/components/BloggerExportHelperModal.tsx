import React from 'react';
import { X, Globe, Code, ArrowRight, CheckCircle2, Copy } from 'lucide-react';

interface BloggerExportHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BloggerExportHelperModal: React.FC<BloggerExportHelperModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg bengali-font">
                ব্লগার ও কাস্টম .com ডোমেন কানেকশন গাইড
              </h3>
              <p className="text-xs text-slate-300 bengali-font">
                পরবর্তীতে এই শপটিকে Blogger বা নিজস্ব ডোমেনে যুক্ত করার সহজ পদ্ধতি
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 bengali-font leading-relaxed max-h-[80vh] overflow-y-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900">
            <h4 className="font-bold text-sm mb-1 flex items-center space-x-1.5">
              <span>📌 বর্তমান স্ট্যাটাস: প্রথম ধাপ সফলভাবে সম্পন্ন</span>
            </h4>
            <p className="text-xs">
              এখন আপনার <strong>Israt BD Shop</strong> কাস্টমার-ফেসিং স্টোরফ্রন্ট পুরোপুরি প্রস্তুত। কার্ট, হোয়াটসঅ্যাপ অর্ডার, ক্যাশ অন ডেলিভারি এবং প্রোডাক্ট ডিটেইলস সবই এখন অ্যাক্টিভ।
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm">
              কিভাবে পরবর্তীতে ব্লগার (Blogger) ও .com ডোমেনে সেটআপ করবেন:
            </h4>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                ১
              </span>
              <div>
                <strong className="text-slate-900">পদ্ধতি ১: ব্লগারে আইফ্রেম বা সিঙ্গেল পেজ এমবেড</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Blogger ড্যাশবোর্ডে গিয়ে একটি নতুন Page তৈরি করে সম্পূর্ণ রেস্পন্সিভ কোড বা বিল্ড এম্বিড করা যাবে, ফলে আপনার ব্লগের ভিজিটররা সরাসরি কেনাকাটা ও হোয়াটসঅ্যাপ অর্ডার করতে পারবেন।
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                ২
              </span>
              <div>
                <strong className="text-slate-900">পদ্ধতি ২: কাস্টম ডোমেন (.com) ডিরেক্ট হোস্টিং</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  আপনার কেনা কাস্টম ডোমেনের (যেমন: <code>isratbdshop.com</code>) DNS সেটিংসে CNAME এবং A রেকর্ড সেট করে সরাসরি ক্লাউডে বা ব্লগারে সাবডোমেন দিয়ে কানেক্ট করতে পারবেন।
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                ৩
              </span>
              <div>
                <strong className="text-slate-900">হোয়াটসঅ্যাপ ও ক্যাশ অন ডেলিভারি স্বয়ংক্রিয় সক্রিয়</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  ব্লগারে সংযোগ করার পরেও গ্রাহকের সব অর্ডার সরাসরি আপনার হোয়াটসঅ্যাপে পণ্যের বিবরণ, মোট টাকা ও ঠিকানাসহ চলে আসবে।
                </p>
              </div>
            </div>

            {/* Blogger Mobile Settings Fix */}
            <div className="flex items-start space-x-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                ৪
              </span>
              <div>
                <strong className="text-amber-950 font-bold">মোবাইলে &quot;No posts&quot; বা &quot;View web version&quot; বন্ধ করার নিয়ম:</strong>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Blogger ড্যাশবোর্ডে যান &gt; <strong>Theme</strong>-এ যান &gt; &quot;Customize&quot; এর পাশের ছোট ড্রপডাউন তীরে ক্লিক করুন &gt; <strong>Mobile settings</strong> নির্বাচন করুন &gt; <strong>&quot;Desktop&quot;</strong> সিলেক্ট করে Save করুন। এর ফলে অ্যান্ড্রয়েড বা মোবাইলে কখনোই ব্লগারের পুরোনো &quot;পোস্ট নেই&quot; পেজ আসবে না, সরাসরি সম্পূর্ণ শপ ওপেন হবে।
                </p>
              </div>
            </div>

            {/* Blogger Full Theme Template with Mobile Auto-Bypass */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs sm:text-sm">
                  <Code className="w-4 h-4 text-emerald-700" />
                  <span>ব্লগার সম্পূর্ণ থিম কোড (Edit HTML এর জন্য)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const snippet = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultmobile='yes' b:responsive='true' b:version='2' class='v2' dir='ltr' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='UTF-8'/>
  <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  <script type='text/javascript'>
    // Automatically bypass ?m=1 mobile template and open the shop directly
    if (window.location.search &amp;&amp; window.location.search.indexOf('m=1') !== -1) {
      var clean = window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.hash;
      window.location.replace(clean);
    }
    // Forward product parameter and hash to shop iframe
    window.addEventListener('DOMContentLoaded', function() {
      var f = document.getElementById('israt-shop-frame');
      if (f) {
        var query = window.location.search || '';
        var hash = window.location.hash || '';
        if (query || hash) {
          f.src = 'https://nhmbd24.github.io/isratbdshop/' + query + hash;
        }
      }
    });
  </script>
  <b:skin><![CDATA[
    html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#F8FAFC; }
    #israt-shop-frame { position:fixed; inset:0; width:100%; height:100%; border:0; display:block; }
  ]]></b:skin>
</head>
<body>
  <iframe allow='clipboard-read; clipboard-write' id='israt-shop-frame' referrerpolicy='strict-origin-when-cross-origin' src='https://nhmbd24.github.io/isratbdshop/' title='Israt BD Shop'></iframe>
  <b:section class='main' id='main' showaddelement='no'/>
</body>
</html>`;
                    navigator.clipboard.writeText(snippet);
                    alert('ব্লগার সম্পূর্ণ থিম কোড কপি হয়েছে!');
                  }}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>কোড কপি করুন</span>
                </button>
              </div>
              <p className="text-[11px] text-emerald-800">
                এই সম্পূর্ণ কোডটি Blogger Theme &gt; Edit HTML-এ থাকা সমস্ত পুরোনো কোড মুছে দিয়ে সেখানে পেস্ট করে Save করুন। এটি স্বয়ংক্রিয়ভাবে ?m=1 বাইপাস করবে এবং মোবাইলে ও কম্পিউটারে সরাসরি আপনার মূল শপ ওপেন করবে।
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
            >
              বুঝেছি, প্রিভিউ দেখুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
