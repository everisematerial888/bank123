'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// ==========================================
// 🔥 Firebase 設定（已幫妳填入金鑰與基本架構）
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyB5-9UwCJdShs-xh7GqDO9cZnWw_sqon0o",
  authDomain: "bank123-joint.firebaseapp.com",
  projectId: "bank123-joint",
  storageBucket: "bank123-joint.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890"
};

// 初始化 Firebase 與 Firestore 資料庫
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2026/01 - 2026/05 富邦銀行初始明細 (作為資料庫沒資料時的預設基底)
const initialData = [
  { id: 1, date: "2026-05-13", type: "刷卡消費", expense: 3695, income: 0, description: "微風南山", category: "Credit Card", note: "" },
  { id: 2, date: "2026-05-13", type: "刷卡消費", expense: 3181, income: 0, description: "BELLAV", category: "Credit Card", note: "" },
  { id: 10, date: "2026-05-11", type: "CD提款", expense: 50000, income: 0, description: "提款", category: "Transfer/Withdrawal", note: "" },
  { id: 11, date: "2026-05-11", type: "行動跨轉", expense: 50015, income: 0, description: "馬哥借款", category: "Transfer/Withdrawal", note: "" },
  { id: 14, date: "2026-05-08", type: "CD轉收", expense: 0, income: 50000, description: "轉入", category: "Income", note: "" },
  { id: 44, date: "2026-04-27", type: "CD存現", expense: 0, income: 85000, description: "V 0000008168001", category: "Income", note: "" },
  { id: 49, date: "2026-04-22", type: "刷卡消費", expense: 8990, income: 0, description: "特力屋士林店", category: "Credit Card", note: "" },
  { id: 75, date: "2026-04-10", type: "CD轉收", expense: 0, income: 30000, description: "轉入", category: "Income", note: "" },
  { id: 102, date: "2026-03-12", type: "CD轉收", expense: 0, income: 25800, description: "26年共同紅", category: "Income", note: "" },
  { id: 115, date: "2026-03-05", type: "刷卡消費", expense: 4224, income: 0, description: "台北萬豪酒店", category: "Credit Card", note: "" },
  { id: 134, date: "2026-02-19", type: "CD轉收", expense: 0, income: 45000, description: "轉入", category: "Income", note: "" },
  { id: 136, date: "2026-02-13", type: "刷卡消費", expense: 12943, income: 0, description: "昇恒昌(股)", category: "Credit Card", note: "" },
  { id: 166, date: "2026-01-14", type: "刷卡消費", expense: 6000, income: 0, description: "饗賓餐旅事業", category: "Credit Card", note: "" },
  { id: 170, date: "2026-01-04", type: "CD轉收", expense: 0, income: 7000, description: "12月薪水", category: "Income", note: "" }
];

export default function JointAccountTracker() {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All"); 
  const [loading, setLoading] = useState(true);
  
  const [newRow, setNewRow] = useState({ date: '', type: '刷卡消費', expense: 0, income: 0, description: '', category: 'Credit Card', note: '' });

  // 1. 從 Firebase 雲端讀取最新的記帳資料
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const docRef = doc(db, "accounting", "joint_account");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().list) {
          setTransactions(docSnap.data().list);
        } else {
          // 如果 Firebase 裡面還沒建檔，就拿 1-5 月的初始資料當作基底
          setTransactions(initialData);
          await setDoc(docRef, { list: initialData });
        }
      } catch (error) {
        console.error("Firebase 讀取失敗，改用本地暫存:", error);
        const local = localStorage.getItem('jointAccountData');
        setTransactions(local ? JSON.parse(local) : initialData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCloudData();
  }, []);

  // 2. 雲端自動儲存機制：只要任何項目有更動（新增、刪除、寫備註），就即時送回 Firebase
  const saveToCloud = async (updatedList) => {
    setTransactions(updatedList);
    localStorage.setItem('jointAccountData', JSON.stringify(updatedList));
    try {
      await setDoc(doc(db, "accounting", "joint_account"), { list: updatedList });
    } catch (error) {
      console.error("Firebase 雲端同步失敗:", error);
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

  if (loading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-neutral-500 font-medium tracking-widest text-sm uppercase">📡 正在從 Firebase 雲端同步中...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">💍 Cindy & Ray 共同帳戶</h1>
            <p className="text-sm text-emerald-600 font-medium mt-1">● Firebase 雲端即時記憶模式已啟動</p>
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
                    <th className="p-4">日期</th>
                    <th className="p-4">描述項目</th>
                    <th className="p-4 text-right">金額</th>
                    <th className="p-4">備註編輯 (雲端自動儲存)</th>
                    <th className="p-4 text-center">操作</th>
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
                      <td className="p-4 text-right font-semibold">
                        {t.income > 0 ? (
                          <span className="text-emerald-600">+${t.income.toLocaleString()}</span>
                        ) : (
                          <span className="text-neutral-800">${t.expense.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <input 
                          type="text" 
                          value={t.note} 
                          placeholder="點擊在此新增備註..."
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
                  <input type="date" value={newRow.date} onChange={e => setNewRow({...newRow, date: e.target.value})} className="w-full p-2 border border-neutral-200 rounded-lg outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-400 mb-1">大類功能</label>
                    <select value={newRow.category} onChange={e => setNewRow({...newRow, category: e.target.value, type: e.target.value === 'Credit Card' ? '刷卡消費' : e.target.value === 'Income' ? 'CD轉收' : '行動跨轉'})} className="w-full p-2 border border-neutral-200 rounded-lg bg-white">
                      <option value="Credit Card">信用卡消費</option>
                      <option value="Income">進帳總額</option>
                      <option value="Transfer/Withdrawal">轉帳提款</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">摘要類型</label>
                    <input type="text" value={newRow.type} onChange={e => setNewRow({...newRow, type: e.target.value})} className="w-full p-2 border border-neutral-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">項目描述</label>
                  <input type="text" placeholder="商家或活動" value={newRow.description} onChange={e => setNewRow({...newRow, description: e.target.value})} className="w-full p-2 border border-neutral-200 rounded-lg outline-none" />
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