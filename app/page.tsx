'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// ==========================================
// 🔥 Firebase 真實設定 (raycybank)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCMXEBGukt4d-VBCNbaDQuNhqW8tlDA6m0",
  authDomain: "raycybank.firebaseapp.com",
  projectId: "raycybank",
  storageBucket: "raycybank.firebasestorage.app",
  messagingSenderId: "726164397714",
  appId: "1:726164397714:web:811d072541c3535b1d904b"
};

// 初始化 Firebase 與 Firestore 資料庫
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 📊 完整匯入 2026/01 - 2026/05 富邦銀行共同帳戶明細 (171筆)
// ==========================================
const initialData = [
  // 2026/05
  { id: 1, date: "2026-05-13", type: "刷卡消費", expense: 3695, income: 0, description: "微風南山", category: "Credit Card", note: "" },
  { id: 2, date: "2026-05-13", type: "刷卡消費", expense: 3181, income: 0, description: "BELLAV", category: "Credit Card", note: "" },
  { id: 3, date: "2026-05-13", type: "刷卡消費", expense: 2118, income: 0, description: "IKIGAI", category: "Credit Card", note: "" },
  { id: 4, date: "2026-05-13", type: "刷卡消費", expense: 318, income: 0, description: "優步-麥當勞", category: "Credit Card", note: "" },
  { id: 5, date: "2026-05-13", type: "刷卡消費", expense: 220, income: 0, description: "新光三越百貨", category: "Credit Card", note: "" },
  { id: 6, date: "2026-05-13", type: "刷卡消費", expense: 180, income: 0, description: "農安停車場", category: "Credit Card", note: "" },
  { id: 7, date: "2026-05-13", type: "刷卡消費", expense: 165, income: 0, description: "優步-皇冠大", category: "Credit Card", note: "" },
  { id: 8, date: "2026-05-13", type: "刷卡消費", expense: 134, income: 0, description: "優步-皇冠大", category: "Credit Card", note: "" },
  { id: 9, date: "2026-05-13", type: "刷卡消費", expense: 116, income: 0, description: "優步-QT", category: "Credit Card", note: "" },
  { id: 10, date: "2026-05-11", type: "CD提款", expense: 50000, income: 0, description: "提款", category: "Transfer/Withdrawal", note: "" },
  { id: 11, date: "2026-05-11", type: "行動跨轉", expense: 50015, income: 0, description: "馬哥借款", category: "Transfer/Withdrawal", note: "" },
  { id: 12, date: "2026-05-11", type: "行動跨轉", expense: 50015, income: 0, description: "馬哥借款", category: "Transfer/Withdrawal", note: "" },
  { id: 13, date: "2026-05-11", type: "CD轉收", expense: 0, income: 11000, description: "轉入", category: "Income", note: "" },
  { id: 14, date: "2026-05-08", type: "CD轉收", expense: 0, income: 50000, description: "轉入", category: "Income", note: "" },
  { id: 15, date: "2026-05-08", type: "CD轉收", expense: 0, income: 50000, description: "轉入", category: "Income", note: "" },
  { id: 16, date: "2026-05-08", type: "刷卡消費", expense: 4021, income: 0, description: "誠品生活股份", category: "Credit Card", note: "" },
  { id: 17, date: "2026-05-08", type: "刷卡消費", expense: 1200, income: 0, description: "聖保羅-大安", category: "Credit Card", note: "" },
  { id: 18, date: "2026-05-08", type: "刷卡消費", expense: 229, income: 0, description: "全家便利商店", category: "Credit Card", note: "" },
  { id: 19, date: "2026-05-08", type: "刷卡消費", expense: 129, income: 0, description: "統一超商-信", category: "Credit Card", note: "" },
  { id: 20, date: "2026-05-07", type: "CD轉收", expense: 0, income: 50000, description: "轉入", category: "Income", note: "" },
  { id: 21, date: "2026-05-07", type: "刷卡消費", expense: 3016, income: 0, description: "海底撈火鍋股", category: "Credit Card", note: "" },
  { id: 22, date: "2026-05-06", type: "刷卡消費", expense: 3362, income: 0, description: "BELLAV", category: "Credit Card", note: "" },
  { id: 23, date: "2026-05-06", type: "刷卡消費", expense: 1003, income: 0, description: "SHEIN.COM", category: "Credit Card", note: "" },
  { id: 24, date: "2026-05-06", type: "刷卡消費", expense: 697, income: 0, description: "茶海永春店", category: "Credit Card", note: "" },
  { id: 25, date: "2026-05-06", type: "刷卡消費", expense: 660, income: 0, description: "GOOGLE *Google", category: "Credit Card", note: "" },
  { id: 26, date: "2026-05-06", type: "刷卡消費", expense: 386, income: 0, description: "being", category: "Credit Card", note: "" },
  { id: 27, date: "2026-05-06", type: "刷卡消費", expense: 289, income: 0, description: "萊爾富-松山", category: "Credit Card", note: "" },
  { id: 28, date: "2026-05-06", type: "刷卡消費", expense: 211, income: 0, description: "萊爾富-松山", category: "Credit Card", note: "" },
  { id: 29, date: "2026-05-06", type: "刷卡消費", expense: 204, income: 0, description: "萊爾富-松山", category: "Credit Card", note: "" },
  { id: 30, date: "2026-05-06", type: "刷卡消費", expense: 110, income: 0, description: "BELLAV", category: "Credit Card", note: "" },
  { id: 31, date: "2026-05-06", type: "刷卡消費", expense: 100, income: 0, description: "台北101", category: "Credit Card", note: "" },
  { id: 32, date: "2026-05-06", type: "刷卡消費", expense: 75, income: 0, description: "Fake S", category: "Credit Card", note: "" },
  { id: 33, date: "2026-05-06", type: "刷卡消費", expense: 61, income: 0, description: "101文具天", category: "Credit Card", note: "" },
  { id: 34, date: "2026-05-05", type: "刷卡消費", expense: 2778, income: 0, description: "德朗火鍋-松", category: "Credit Card", note: "" },
  { id: 35, date: "2026-05-05", type: "刷卡消費", expense: 80, income: 0, description: "寶雅生活館忠", category: "Credit Card", note: "" },
  { id: 36, date: "2026-05-04", type: "刷卡消費", expense: 30880, income: 0, description: "嘉鎷興業股份", category: "Credit Card", note: "" },
  { id: 37, date: "2026-05-04", type: "刷卡消費", expense: 3425, income: 0, description: "UR LIV", category: "Credit Card", note: "" },
  { id: 38, date: "2026-05-04", type: "刷卡消費", expense: 1581, income: 0, description: "PULL &", category: "Credit Card", note: "" },
  { id: 39, date: "2026-05-04", type: "刷卡消費", expense: 1078, income: 0, description: "新光三越百貨", category: "Credit Card", note: "" },
  { id: 40, date: "2026-05-04", type: "刷卡消費", expense: 150, income: 0, description: "Fake S", category: "Credit Card", note: "" },

  // 2026/04
  { id: 41, date: "2026-04-30", type: "刷卡消費", expense: 3288, income: 0, description: "海底撈火鍋股", category: "Credit Card", note: "" },
  { id: 42, date: "2026-04-30", type: "刷卡消費", expense: 100, income: 0, description: "ATT 4", category: "Credit Card", note: "" },
  { id: 43, date: "2026-04-28", type: "刷卡消費", expense: 1800, income: 0, description: "綠界-Mag", category: "Credit Card", note: "" },
  { id: 44, date: "2026-04-27", type: "CD存現", expense: 0, income: 85000, description: "V 0000008168001", category: "Income", note: "" },
  { id: 45, date: "2026-04-24", type: "刷卡消費", expense: 2580, income: 0, description: "新光三越百貨", category: "Credit Card", note: "" },
  { id: 46, date: "2026-04-23", type: "刷卡消費", expense: 4042, income: 0, description: "海底撈火鍋股", category: "Credit Card", note: "" },
  { id: 47, date: "2026-04-23", type: "刷卡消費", expense: 767, income: 0, description: "全聯福利中心", category: "Credit Card", note: "" },
  { id: 48, date: "2026-04-23", type: "刷卡消費", expense: 45, income: 0, description: "全家便利商店", category: "Credit Card", note: "" },
  { id: 49, date: "2026-04-22", type: "刷卡消費", expense: 8990, income: 0, description: "特力屋士林店", category: "Credit Card", note: "" },
  { id: 50, date: "2026-04-22", type: "刷卡消費", expense: 3124, income: 0, description: "微風信義美食", category: "Credit Card", note: "" },
  { id: 51, date: "2026-04-22", type: "刷卡消費", expense: 1618, income: 0, description: "天玥餐飲股份", category: "Credit Card", note: "" },
  { id: 52, date: "2026-04-22", type: "刷卡消費", expense: 1418, income: 0, description: "遠東百貨股份", category: "Credit Card", note: "" },
  { id: 53, date: "2026-04-22", type: "刷卡消費", expense: 1157, income: 0, description: "新光三越百貨", category: "Credit Card", note: "" },
  { id: 54, date: "2026-04-22", type: "刷卡消費", expense: 814, income: 0, description: "莫內莊園", category: "Credit Card", note: "" },
  { id: 55, date: "2026-04-22", type: "刷卡消費", expense: 399, income: 0, description: "HOLA和樂", category: "Credit Card", note: "" },
  { id: 56, date: "2026-04-22", type: "刷卡消費", expense: 140, income: 0, description: "遠東百貨股份", category: "Credit Card", note: "" },
  { id: 57, date: "2026-04-21", type: "刷卡消費", expense: 1032, income: 0, description: "C06_MM", category: "Credit Card", note: "" },
  { id: 58, date: "2026-04-21", type: "刷卡消費", expense: 260, income: 0, description: "家樂福超市士", category: "Credit Card", note: "" },
  { id: 59, date: "2026-04-21", type: "刷卡消費", expense: 89, income: 0, description: "統一超商-信", category: "Credit Card", note: "" },
  { id: 60, date: "2026-04-20", type: "CD轉收", expense: 0, income: 200, description: "路", category: "Income", note: "" },
  { id: 61, date: "2026-04-15", type: "刷卡消費", expense: 3735, income: 0, description: "GINZA LOFT", category: "Credit Card", note: "" },
  { id: 62, date: "2026-04-15", type: "刷卡消費", expense: 153, income: 0, description: "優步-皇冠大", category: "Credit Card", note: "" },
  { id: 63, date: "2026-04-14", type: "刷卡消費", expense: 1603, income: 0, description: "DiDi Mobility", category: "Credit Card", note: "" },
  { id: 64, date: "2026-04-14", type: "刷卡消費", expense: 508, income: 0, description: "DiDi Mobility", category: "Credit Card", note: "" },
  { id: 65, date: "2026-04-14", type: "刷卡消費", expense: 427, income: 0, description: "DiDi Mobility", category: "Credit Card", note: "" },
  { id: 66, date: "2026-04-14", type: "刷卡消費", expense: 204, income: 0, description: "DiDi Mobility", category: "Credit Card", note: "" },
  { id: 67, date: "2026-04-14", type: "刷卡消費", expense: 204, income: 0, description: "MOBILE SUICA A", category: "Credit Card", note: "" },
  { id: 68, date: "2026-04-14", type: "刷卡消費", expense: 155, income: 0, description: "TOKYO DISNEY R", category: "Credit Card", note: "" },
  { id: 69, date: "2026-04-14", type: "刷卡消費", expense: 128, income: 0, description: "DiDi Mobility", category: "Credit Card", note: "" },
  { id: 70, date: "2026-04-14", type: "刷卡消費", expense: 89, income: 0, description: "DiDi Mobility", category: "Credit Card", note: "" },
  { id: 71, date: "2026-04-14", type: "刷卡消費", expense: 75, income: 0, description: "統一超商-新", category: "Credit Card", note: "" },
  { id: 72, date: "2026-04-14", type: "刷卡消費", expense: 60, income: 0, description: "統一超商-新", category: "Credit Card", note: "" },
  { id: 73, date: "2026-04-14", type: "刷卡退貨", expense: 0, income: 60, description: "統一超商-新", category: "Income", note: "" },
  { id: 74, date: "2026-04-13", type: "刷卡消費", expense: 204, income: 0, description: "MOBILE SUICA A", category: "Credit Card", note: "" },
  { id: 75, date: "2026-04-10", type: "CD轉收", expense: 0, income: 30000, description: "轉入", category: "Income", note: "" },
  { id: 76, date: "2026-04-10", type: "刷卡消費", expense: 1438, income: 0, description: "DiDi Mobility", category: "Credit Card", note: "" },
  { id: 77, date: "2026-04-10", type: "刷卡消費", expense: 514, income: 0, description: "DiDi Mobility", category: "Credit Card", note: "" },
  { id: 78, date: "2026-04-09", type: "刷卡消費", expense: 660, income: 0, description: "GOOGLE *Google", category: "Credit Card", note: "" },
  { id: 79, date: "2026-04-09", type: "刷卡消費", expense: 205, income: 0, description: "MOBILE SUICA A", category: "Credit Card", note: "" },
  { id: 80, date: "2026-04-07", type: "刷卡消費", expense: 673, income: 0, description: "GOLFPARTNER", category: "Credit Card", note: "" },
  { id: 81, date: "2026-04-02", type: "刷卡消費", expense: 312, income: 0, description: "KKday", category: "Credit Card", note: "" },
  { id: 82, date: "2026-04-01", type: "刷卡消費", expense: 116, income: 0, description: "LIME*RIDE ES6P", category: "Credit Card", note: "" },

  // 2026/03
  { id: 83, date: "2026-03-25", type: "刷卡消費", expense: 1023, income: 0, description: "MOBILE SUICA A", category: "Credit Card", note: "" },
  { id: 84, date: "2026-03-25", type: "刷卡消費", expense: 20, income: 0, description: "SHILKHAT AKIHA", category: "Credit Card", note: "" },
  { id: 85, date: "2026-03-25", type: "刷卡消費", expense: 20, income: 0, description: "SHILKHAT AKIHA", category: "Credit Card", note: "" },
  { id: 86, date: "2026-03-25", type: "刷卡消費", expense: 20, income: 0, description: "SHILKHAT AKIHA", category: "Credit Card", note: "" },
  { id: 87, date: "2026-03-25", type: "刷卡消費", expense: 20, income: 0, description: "SHILKHAT AKIHA", category: "Credit Card", note: "" },
  { id: 88, date: "2026-03-24", type: "刷卡消費", expense: 403, income: 0, description: "UBER *TRIP HEL", category: "Credit Card", note: "" },
  { id: 89, date: "2026-03-23", type: "行動跨轉", expense: 6336, income: 0, description: "轉出", category: "Transfer/Withdrawal", note: "" },
  { id: 90, date: "2026-03-18", type: "刷卡消費", expense: 1198, income: 0, description: "燦坤3C-忠", category: "Credit Card", note: "" },
  { id: 91, date: "2026-03-18", type: "刷卡消費", expense: 978, income: 0, description: "寶雅生活館忠", category: "Credit Card", note: "" },
  { id: 92, date: "2026-03-18", type: "刷卡消費", expense: 867, income: 0, description: "寶雅生活館忠", category: "Credit Card", note: "" },
  { id: 93, date: "2026-03-18", type: "刷卡消費", expense: 236, income: 0, description: "台灣麥當勞S", category: "Credit Card", note: "" },
  { id: 94, date: "2026-03-17", type: "刷卡消費", expense: 3580, income: 0, description: "特力屋士林店", category: "Credit Card", note: "" },
  { id: 95, date: "2026-03-17", type: "刷卡消費", expense: 426, income: 0, description: "純禾商行(諾", category: "Credit Card", note: "" },
  { id: 96, date: "2026-03-16", type: "刷卡消費", expense: 407, income: 0, description: "Mia Cb", category: "Credit Card", note: "" },
  { id: 97, date: "2026-03-16", type: "刷卡消費", expense: 131, income: 0, description: "全家便利商店", category: "Credit Card", note: "" },
  { id: 98, date: "2026-03-13", type: "刷卡消費", expense: 450, income: 0, description: "夏功夫", category: "Credit Card", note: "" },
  { id: 99, date: "2026-03-13", type: "刷卡消費", expense: 399, income: 0, description: "屈臣氏S05", category: "Credit Card", note: "" },
  { id: 100, date: "2026-03-13", type: "刷卡消費", expense: 361, income: 0, description: "SHEIN.COM", category: "Credit Card", note: "" },
  { id: 101, date: "2026-03-13", type: "刷卡消費", expense: 153, income: 0, description: "統一超商-京", category: "Credit Card", note: "" },
  { id: 102, date: "2026-03-12", type: "CD轉收", expense: 0, income: 25800, description: "26年共同紅", category: "Income", note: "" },
  { id: 103, date: "2026-03-12", type: "刷卡消費", expense: 1647, income: 0, description: "中油-光復北", category: "Credit Card", note: "" },
  { id: 104, date: "2026-03-12", type: "刷卡消費", expense: 210, income: 0, description: "3158聯通", category: "Credit Card", note: "" },
  { id: 105, date: "2026-03-11", type: "刷卡消費", expense: 1917, income: 0, description: "天玥餐飲股份", category: "Credit Card", note: "" },
  { id: 106, date: "2026-03-11", type: "刷卡消費", expense: 391, income: 0, description: "HOHO D", category: "Credit Card", note: "" },
  { id: 107, date: "2026-03-11", type: "刷卡消費", expense: 95, income: 0, description: "優步-Q2", category: "Credit Card", note: "" },
  { id: 108, date: "2026-03-10", type: "刷卡消費", expense: 434, income: 0, description: "優食-Azu", category: "Credit Card", note: "" },
  { id: 109, date: "2026-03-10", type: "刷卡消費", expense: 160, income: 0, description: "正好停股份有", category: "Credit Card", note: "" },
  { id: 110, date: "2026-03-09", type: "CD提款", expense: 10020, income: 0, description: "提款", category: "Transfer/Withdrawal", note: "" },
  { id: 111, date: "2026-03-09", type: "刷卡消費", expense: 480, income: 0, description: "ATT4FU", category: "Credit Card", note: "" },
  { id: 112, date: "2026-03-09", type: "刷卡消費", expense: 175, income: 0, description: "寶雅生活館信", category: "Credit Card", note: "" },
  { id: 113, date: "2026-03-06", type: "刷卡消費", expense: 213, income: 0, description: "GOOGLE *Google", category: "Credit Card", note: "" },
  { id: 114, date: "2026-03-06", type: "刷卡消費", expense: 113, income: 0, description: "優步-QT", category: "Credit Card", note: "" },
  { id: 115, date: "2026-03-05", type: "刷卡消費", expense: 4224, income: 0, description: "台北萬豪酒店", category: "Credit Card", note: "" },
  { id: 116, date: "2026-03-04", type: "刷卡消費", expense: 1915, income: 0, description: "ATT4FU", category: "Credit Card", note: "" },
  { id: 117, date: "2026-03-04", type: "刷卡消費", expense: 522, income: 0, description: "Shein", category: "Credit Card", note: "" },
  { id: 118, date: "2026-03-03", type: "刷卡消費", expense: 440, income: 0, description: "王將-信義威", category: "Credit Card", note: "" },
  { id: 119, date: "2026-03-03", type: "刷卡消費", expense: 129, income: 0, description: "全家便利商店", category: "Credit Card", note: "" },
  { id: 120, date: "2026-03-02", type: "刷卡消費", expense: 160, income: 0, description: "統一超商-信", category: "Credit Card", note: "" },
  { id: 121, date: "2026-03-02", type: "刷卡消費", expense: 55, income: 0, description: "全家便利商店", category: "Credit Card", note: "" },
  { id: 122, date: "2026-03-01", type: "行動跨轉", expense: 5015, income: 0, description: "唐", category: "Transfer/Withdrawal", note: "" },

  // 2026/02
  { id: 123, date: "2026-02-26", type: "刷卡消費", expense: 1928, income: 0, description: "明志加油站實", category: "Credit Card", note: "" },
  { id: 124, date: "2026-02-25", type: "刷卡消費", expense: 2746, income: 0, description: "昇恒昌(股)", category: "Credit Card", note: "" },
  { id: 125, date: "2026-02-25", type: "刷卡消費", expense: 1166, income: 0, description: "莫內莊園", category: "Credit Card", note: "" },
  { id: 126, date: "2026-02-25", type: "刷卡消費", expense: 990, income: 0, description: "Apple", category: "Credit Card", note: "" },
  { id: 127, date: "2026-02-25", type: "刷卡消費", expense: 766, income: 0, description: "優食-TRU", category: "Credit Card", note: "" },
  { id: 128, date: "2026-02-25", type: "刷卡消費", expense: 648, income: 0, description: "優食-Azu", category: "Credit Card", note: "" },
  { id: 129, date: "2026-02-25", type: "刷卡消費", expense: 613, income: 0, description: "MTR-KIOSK PAYM", category: "Credit Card", note: "" },
  { id: 130, date: "2026-02-25", type: "刷卡消費", expense: 359, income: 0, description: "優食-UG", category: "Credit Card", note: "" },
  { id: 131, date: "2026-02-25", type: "刷卡消費", expense: 303, income: 0, description: "SHEIN.COM", category: "Credit Card", note: "" },
  { id: 132, date: "2026-02-25", type: "刷卡消費", expense: 236, income: 0, description: "優食-麻古茶", category: "Credit Card", note: "" },
  { id: 133, date: "2026-02-25", type: "刷卡退貨", expense: 0, income: 128, description: "優食-TRU", category: "Income", note: "" },
  { id: 134, date: "2026-02-19", type: "CD轉收", expense: 0, income: 45000, description: "轉入", category: "Income", note: "" },
  { id: 135, date: "2026-02-16", type: "行動跨轉", expense: 30015, income: 0, description: "轉出", category: "Transfer/Withdrawal", note: "" },
  { id: 136, date: "2026-02-13", type: "刷卡消費", expense: 12943, income: 0, description: "昇恒昌(股)", category: "Credit Card", note: "" },
  { id: 137, date: "2026-02-13", type: "刷卡消費", expense: 340, income: 0, description: "昇恒昌(股)", category: "Credit Card", note: "" },
  { id: 138, date: "2026-02-13", type: "刷卡消費", expense: 340, income: 0, description: "昇恒昌(股)", category: "Credit Card", note: "" },
  { id: 139, date: "2026-02-13", type: "刷卡消費", expense: 220, income: 0, description: "LaLapo", category: "Credit Card", note: "" },
  { id: 140, date: "2026-02-13", type: "刷卡消費", expense: 120, income: 0, description: "昇恒昌(股)", category: "Credit Card", note: "" },
  { id: 141, date: "2026-02-12", type: "CD轉收", expense: 0, income: 4665, description: "轉入", category: "Income", note: "" },
  { id: 142, date: "2026-02-11", type: "刷卡消費", expense: 1639, income: 0, description: "IKIGAI", category: "Credit Card", note: "" },
  { id: 143, date: "2026-02-11", type: "刷卡消費", expense: 1491, income: 0, description: "PULL &", category: "Credit Card", note: "" },
  { id: 144, date: "2026-02-11", type: "刷卡消費", expense: 607, income: 0, description: "優食-亮鐵板", category: "Credit Card", note: "" },
  { id: 145, date: "2026-02-10", type: "CD轉收", expense: 0, income: 12000, description: "睿睿情人節快", category: "Income", note: "" },
  { id: 146, date: "2026-02-10", type: "刷卡消費", expense: 397, income: 0, description: "優食-麥當勞", category: "Credit Card", note: "" },
  { id: 147, date: "2026-02-10", type: "刷卡消費", expense: 19, income: 0, description: "北市路邊停車", category: "Credit Card", note: "" },
  { id: 148, date: "2026-02-09", type: "行動跨轉", expense: 2585, income: 0, description: "唐", category: "Transfer/Withdrawal", note: "" },
  { id: 149, date: "2026-02-06", type: "CD轉收", expense: 0, income: 10000, description: "轉入", category: "Income", note: "" },
  { id: 150, date: "2026-02-06", type: "CD轉收", expense: 0, income: 50000, description: "轉入", category: "Income", note: "" },
  { id: 151, date: "2026-02-06", type: "刷卡消費", expense: 435, income: 0, description: "優食-亮鐵板", category: "Credit Card", note: "" },
  { id: 152, date: "2026-02-06", type: "刷卡消費", expense: 213, income: 0, description: "Google One", category: "Credit Card", note: "" },
  { id: 153, date: "2026-02-03", type: "刷卡退貨", expense: 0, income: 630, description: "Shein", category: "Income", note: "" },
  { id: 154, date: "2026-02-02", type: "刷卡消費", expense: 143, income: 0, description: "台灣大創百貨", category: "Credit Card", note: "" },

  // 2026/01
  { id: 155, date: "2026-01-29", type: "刷卡消費", expense: 1384, income: 0, description: "C06 MM", category: "Credit Card", note: "" },
  { id: 156, date: "2026-01-28", type: "刷卡消費", expense: 1615, income: 0, description: "大樂司文創股", category: "Credit Card", note: "" },
  { id: 157, date: "2026-01-28", type: "刷卡消費", expense: 1600, income: 0, description: "藏壽司-信義", category: "Credit Card", note: "" },
  { id: 158, date: "2026-01-28", type: "刷卡消費", expense: 1436, income: 0, description: "IKIGAI", category: "Credit Card", note: "" },
  { id: 159, date: "2026-01-28", type: "刷卡消費", expense: 240, income: 0, description: "新光三越百貨", category: "Credit Card", note: "" },
  { id: 160, date: "2026-01-22", type: "刷卡消費", expense: 299, income: 0, description: "優食-UG", category: "Credit Card", note: "" },
  { id: 161, date: "2026-01-21", type: "刷卡消費", expense: 599, income: 0, description: "燦坤3C-忠", category: "Credit Card", note: "" },
  { id: 162, date: "2026-01-21", type: "刷卡消費", expense: 457, income: 0, description: "寶雅生活館忠", category: "Credit Card", note: "" },
  { id: 163, date: "2026-01-21", type: "刷卡消費", expense: 170, income: 0, description: "GLORIA", category: "Credit Card", note: "" },
  { id: 164, date: "2026-01-20", type: "CD轉收", expense: 0, income: 10000, description: "轉入", category: "Income", note: "" },
  { id: 165, date: "2026-01-20", type: "刷卡消費", expense: 1629, income: 0, description: "Shein", category: "Credit Card", note: "" },
  { id: 166, date: "2026-01-14", type: "刷卡消費", expense: 6000, income: 0, description: "饗賓餐旅事業", category: "Credit Card", note: "" },
  { id: 167, date: "2026-01-14", type: "刷卡消費", expense: 300, income: 0, description: "遠東SOGO", category: "Credit Card", note: "" },
  { id: 168, date: "2026-01-13", type: "刷卡消費", expense: 1600, income: 0, description: "綠界-Mag", category: "Credit Card", note: "" },
  { id: 169, date: "2026-01-09", type: "CD轉收", expense: 0, income: 4000, description: "轉入", category: "Income", note: "" },
  { id: 170, date: "2026-01-04", type: "CD轉收", expense: 0, income: 7000, description: "12月薪水", category: "Income", note: "" },
  { id: 171, date: "2026-01-13", type: "掛失贖回", expense: 0, income: 25, description: "利息/其他", category: "Income", note: "" }
];

export default function JointAccountTracker() {
  const [transactions, setTransactions] = useState<{id: number, date: string, type: string, expense: number, income: number, description: string, category: string, note: string}[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All"); 
  const [loading, setLoading] = useState(true);
  
  const [newRow, setNewRow] = useState({ date: '', type: '刷卡消費', expense: 0, income: 0, description: '', category: 'Credit Card', note: '' });

  // ==========================================
  // 1. 從 Firebase 雲端讀取最新資料
  // ==========================================
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        // ✨ 已修改：換成全新檔名 "joint_account_v2" 強制載入 171 筆資料
        const docRef = doc(db, "accounting", "joint_account_v2");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().list) {
          setTransactions(docSnap.data().list);
        } else {
          // 如果資料庫是空的，就寫入上面那 171 筆預設資料
          setTransactions(initialData);
          await setDoc(docRef, { list: initialData });
        }
      } catch (error) {
        console.error("Firebase 讀取失敗，請確認已在 Firestore 開啟「測試模式」規則 (allow read, write: if true;):", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCloudData();
  }, []);

  // ==========================================
  // 2. 儲存更動回 Firebase 雲端
  // ==========================================
  const saveToCloud = async (updatedList: any) => {
    setTransactions(updatedList);
    try {
      // ✨ 已修改：同步存入 "joint_account_v2"
      await setDoc(doc(db, "accounting", "joint_account_v2"), { list: updatedList });
    } catch (error) {
      console.error("Firebase 同步失敗:", error);
      alert("儲存失敗！請確認 Firestore 資料庫規則是否已設定為 allow read, write: if true;");
    }
  };

  const months = useMemo(() => {
    const allMonths = transactions.map(t => t.date.substring(0, 7));
    return Array.from(new Set(allMonths)).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchMonth = t.date.startsWith(selectedMonth);
      const matchCat = activeCategoryFilter === "All" ? true : t.category === activeCategoryFilter;
      return matchMonth && matchCat;
    });
  }, [transactions, selectedMonth, activeCategoryFilter]);

  const monthlySummary = useMemo(() => {
    const currentMonthData = transactions.filter(t => t.date.startsWith(selectedMonth));
    return currentMonthData.reduce((acc, curr) => {
      if (curr.category === "Credit Card") acc.creditCard += curr.expense;
      if (curr.category === "Income") acc.income += curr.income;
      if (curr.category === "Transfer/Withdrawal") acc.transfer += curr.expense;
      return acc;
    }, { creditCard: 0, income: 0, transfer: 0 });
  }, [transactions, selectedMonth]);

  const handleNoteChange = (id: number, newNote: string) => {
    const updated = transactions.map(t => t.id === id ? { ...t, note: newNote } : t);
    saveToCloud(updated);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("確定要刪除這筆紀錄嗎？")) {
      const updated = transactions.filter(t => t.id !== id);
      saveToCloud(updated);
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRow.date || !newRow.description) return alert("請填寫日期與描述！");
    
    const isIncome = newRow.category === "Income";
    const item = {
      id: Date.now(),
      date: newRow.date,
      type: newRow.type,
      expense: isIncome ? 0 : Number(newRow.expense),
      income: isIncome ? Number(newRow.income) : 0,
      description: newRow.description,
      category: newRow.category,
      note: newRow.note
    };
    
    saveToCloud([item, ...transactions]);
    setNewRow({ date: '', type: '刷卡消費', expense: 0, income: 0, description: '', category: 'Credit Card', note: '' });
  };

  // 畫面載入中顯示
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center text-neutral-500 font-medium tracking-widest text-sm uppercase space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800"></div>
        <p>📡 正在從 raycybank 雲端讀取資料庫...</p>
        <p className="text-xs text-red-400 normal-case tracking-normal">若一直卡住，請至 Firebase 控制台確認 Firestore Database 是否已開啟測試模式。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">💍 Cindy & Ray 共同帳戶</h1>
            <p className="text-sm text-emerald-600 font-medium mt-1">● raycybank 雲端即時同步模式已連線</p>
          </div>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-lg shadow-sm outline-none font-medium focus:border-neutral-400"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <button 
            onClick={() => setActiveCategoryFilter(activeCategoryFilter === "Credit Card" ? "All" : "Credit Card")}
            className={`p-6 bg-white rounded-xl text-left border shadow-sm transition-all ${activeCategoryFilter === "Credit Card" ? "border-black ring-1 ring-black" : "border-neutral-100 hover:border-neutral-300"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">💳 信用卡消費總額</p>
            <p className="text-3xl font-bold">${monthlySummary.creditCard.toLocaleString()}</p>
          </button>

          <button 
            onClick={() => setActiveCategoryFilter(activeCategoryFilter === "Income" ? "All" : "Income")}
            className={`p-6 bg-white rounded-xl text-left border shadow-sm transition-all ${activeCategoryFilter === "Income" ? "border-black ring-1 ring-black" : "border-neutral-100 hover:border-neutral-300"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">💰 進帳總額</p>
            <p className="text-3xl font-bold text-neutral-900">${monthlySummary.income.toLocaleString()}</p>
          </button>

          <button 
            onClick={() => setActiveCategoryFilter(activeCategoryFilter === "Transfer/Withdrawal" ? "All" : "Transfer/Withdrawal")}
            className={`p-6 bg-white rounded-xl text-left border shadow-sm transition-all ${activeCategoryFilter === "Transfer/Withdrawal" ? "border-black ring-1 ring-black" : "border-neutral-100 hover:border-neutral-300"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">💸 轉帳提款支出</p>
            <p className="text-3xl font-bold text-neutral-900">${monthlySummary.transfer.toLocaleString()}</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <h2 className="font-semibold text-neutral-800">
                {selectedMonth} {activeCategoryFilter === "All" ? "完整交易明細" : `${activeCategoryFilter} 細項`}
              </h2>
              <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded-full font-medium">
                {filteredTransactions.length} 筆項目
              </span>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-400 text-xs font-semibold uppercase">
                    <th className="p-4 whitespace-nowrap">日期</th>
                    <th className="p-4 whitespace-nowrap">描述項目</th>
                    <th className="p-4 text-right whitespace-nowrap">金額</th>
                    <th className="p-4 whitespace-nowrap">備註編輯 (雲端即時儲存)</th>
                    <th className="p-4 text-center whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="p-4 whitespace-nowrap text-neutral-500">{t.date}</td>
                      <td className="p-4">
                        <div className="font-medium text-neutral-900">{t.description}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">{t.type}</div>
                      </td>
                      <td className="p-4 text-right font-semibold whitespace-nowrap">
                        {t.income > 0 ? (
                          <span className="text-emerald-600">+${t.income.toLocaleString()}</span>
                        ) : (
                          <span className="text-neutral-800">${t.expense.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="p-4 min-w-[200px]">
                        <input 
                          type="text" 
                          value={t.note} 
                          placeholder="點擊新增備註..."
                          onChange={(e) => handleNoteChange(t.id, e.target.value)}
                          className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 rounded px-2 py-1 text-xs outline-none transition-all"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDelete(t.id)} 
                          className="text-neutral-300 hover:text-red-500 transition-colors text-xs"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-neutral-400">當月此分類無任何交易紀錄</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-4 text-sm">➕ 手動新增紀錄</h3>
              <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">交易日期</label>
                  <input type="date" value={newRow.date} onChange={e => setNewRow({...newRow, date: e.target.value})} className="w-full p-2 border border-neutral-200 rounded-lg outline-none focus:border-neutral-400" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-400 mb-1">大類功能</label>
                    <select value={newRow.category} onChange={e => setNewRow({...newRow, category: e.target.value, type: e.target.value === 'Credit Card' ? '刷卡消費' : e.target.value === 'Income' ? 'CD轉收' : '行動跨轉'})} className="w-full p-2 border border-neutral-200 rounded-lg bg-white">
                      <option value="Credit Card">信用卡消費</option>
                      <option value="Income">進帳</option>
                      <option value="Transfer/Withdrawal">轉帳/提款</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">摘要類型</label>
                    <input type="text" value={newRow.type} onChange={e => setNewRow({...newRow, type: e.target.value})} className="w-full p-2 border border-neutral-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">項目描述 (商家或活動)</label>
                  <input type="text" placeholder="例如：微風南山、轉入" value={newRow.description} onChange={e => setNewRow({...newRow, description: e.target.value})} className="w-full p-2 border border-neutral-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">金額</label>
                  <input type="number" value={newRow.category === 'Income' ? newRow.income : newRow.expense} onChange={e => setNewRow(newRow.category === 'Income' ? {...newRow, income: Number(e.target.value)} : {...newRow, expense: Number(e.target.value)})} className="w-full p-2 border border-neutral-200 rounded-lg outline-none" />
                </div>
                <button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium p-2.5 rounded-lg mt-2 transition-all">
                  確認新增並同步雲端
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}