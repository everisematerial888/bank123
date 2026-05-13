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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 初始資料基底
const initialData = [
  { id: 1, date: "2026-05-13", type: "刷卡消費", expense: 3695, income: 0, description: "微風南山", category: "Credit Card", note: "" },
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
  const [transactions, setTransactions] = useState<{id: number, date: string, type: string, expense: number, income: number, description: string, category: string, note: string}[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All"); 
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newRow, setNewRow] = useState({ date: '', type: '刷卡消費', expense: 0, income: 0, description: '', category: 'Credit Card', note: '' });

  // 1. 從 Firebase 讀取
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const docRef = doc(db, "accounting", "joint_account_v3");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().list) {
          setTransactions(docSnap.data().list);
        } else {
          setTransactions(initialData);
          await setDoc(docRef, { list: initialData });
        }
      } catch (error) {
        console.error("讀取失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCloudData();
  }, []);

  // 2. 儲存至 Firebase
  const saveToCloud = async (updatedList: any) => {
    setTransactions(updatedList);
    try {
      await setDoc(doc(db, "accounting", "joint_account_v3"), { list: updatedList });
    } catch (error) {
      console.error("同步失敗:", error);
    }
  };

  // ==========================================
  // 📄 3. 自動解析銀行 PDF 明細邏輯
  // ==========================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 動態載入 PDF 套件，避免伺服器渲染報錯
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let textItems: string[] = [];

      // 逐頁抓取文字
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const strings = textContent.items.map((item: any) => item.str.trim()).filter(Boolean);
        textItems.push(...strings);
      }

      // 智能解析富邦明細格式
      const newTransactions = [];
      let i = 0;
      while (i < textItems.length) {
        // 找尋日期格式 202X/XX/XX
        if (/^202[4-9]\/\d{2}\/\d{2}$/.test(textItems[i])) {
          const date = textItems[i].replace(/\//g, '-');
          let type = "其他";
          let amount = 0;
          let description = "銀行匯入紀錄";
          
          // 往後搜尋附近區塊抓取金額與類型
          for (let j = 1; j <= 12 && i + j < textItems.length; j++) {
            const chunk = textItems[i+j];
            
            // 判斷交易類型
            if (["刷卡消費", "CD轉收", "行動跨轉", "CD提款", "CD存現", "主動儲值", "委代付"].includes(chunk) && type === "其他") {
                type = chunk;
            }
            // 判斷金額 (尋找有逗號的數字，如 1,000.00)
            if (/^[0-9,]+\.\d{2}$/.test(chunk) && amount === 0) {
                amount = parseFloat(chunk.replace(/,/g, ''));
            }
            // 簡單判斷描述 (非日期、非類型、非金額的字串)
            if (j >= 2 && isNaN(Number(chunk.charAt(0))) && !["刷卡消費", "CD轉收", "行動跨轉", "CD提款", "CD存現", "附註", "支出金額"].includes(chunk)) {
                if(description === "銀行匯入紀錄") description = chunk;
            }
          }

          const isIncome = type.includes("轉收") || type.includes("存現") || type.includes("退貨");
          const category = isIncome ? "Income" : (["行動跨轉", "CD提款"].includes(type) ? "Transfer/Withdrawal" : "Credit Card");

          if (amount > 0) {
            newTransactions.push({
              id: Date.now() + Math.random(), // 隨機產生 ID
              date, type, 
              expense: isIncome ? 0 : amount,
              income: isIncome ? amount : 0,
              description, category, note: ""
            });
          }
          i += 6; // 跳過已處理區塊加快速度
        } else {
          i++;
        }
      }

      if (newTransactions.length > 0) {
        // 自動去重複：如果日期、金額、類型完全一樣，就不重複匯入
        const uniqueNew = newTransactions.filter(newTx => {
          return !transactions.some(oldTx => 
            oldTx.date === newTx.date && 
            oldTx.expense === newTx.expense && 
            oldTx.income === newTx.income &&
            oldTx.type === newTx.type
          );
        });

        if (uniqueNew.length > 0) {
          const mergedList = [...uniqueNew, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          saveToCloud(mergedList);
          alert(`🎉 成功解析並匯入 ${uniqueNew.length} 筆新資料！\n(已自動略過 ${newTransactions.length - uniqueNew.length} 筆重複紀錄)`);
        } else {
          alert("💡 這些明細已經都在你的帳本裡囉！沒有需要新增的紀錄。");
        }
      } else {
        alert("⚠️ 解析完成，但在這份 PDF 中沒有找到符合的交易紀錄。");
      }
    } catch (error) {
      console.error("PDF 解析失敗:", error);
      alert("⚠️ 解析失敗！請確認這是可讀取文字的銀行 PDF 明細檔。");
    } finally {
      setIsUploading(false);
      // 清空 input 讓下一次可以重複上傳同一個檔名
      e.target.value = '';
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
    return <div className="min-h-screen flex items-center justify-center">📡 正在載入資料庫...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">💍 Cindy & Ray 共同帳戶</h1>
            <p className="text-sm text-emerald-600 font-medium mt-1">● 雲端同步與 PDF AI 解析已連線</p>
          </div>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-lg shadow-sm font-medium"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <button 
            onClick={() => setActiveCategoryFilter(activeCategoryFilter === "Credit Card" ? "All" : "Credit Card")}
            className={`p-6 bg-white rounded-xl text-left border shadow-sm transition-all ${activeCategoryFilter === "Credit Card" ? "border-black ring-1 ring-black" : "border-neutral-100"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">💳 信用卡消費總額</p>
            <p className="text-3xl font-bold">${monthlySummary.creditCard.toLocaleString()}</p>
          </button>
          <button 
            onClick={() => setActiveCategoryFilter(activeCategoryFilter === "Income" ? "All" : "Income")}
            className={`p-6 bg-white rounded-xl text-left border shadow-sm transition-all ${activeCategoryFilter === "Income" ? "border-black ring-1 ring-black" : "border-neutral-100"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">💰 進帳總額</p>
            <p className="text-3xl font-bold text-neutral-900">${monthlySummary.income.toLocaleString()}</p>
          </button>
          <button 
            onClick={() => setActiveCategoryFilter(activeCategoryFilter === "Transfer/Withdrawal" ? "All" : "Transfer/Withdrawal")}
            className={`p-6 bg-white rounded-xl text-left border shadow-sm transition-all ${activeCategoryFilter === "Transfer/Withdrawal" ? "border-black ring-1 ring-black" : "border-neutral-100"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">💸 轉帳提款支出</p>
            <p className="text-3xl font-bold text-neutral-900">${monthlySummary.transfer.toLocaleString()}</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-neutral-50/50 flex justify-between items-center">
              <h2 className="font-semibold">{selectedMonth} 交易明細</h2>
              <span className="text-xs bg-neutral-200 px-2 py-1 rounded-full">{filteredTransactions.length} 筆</span>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b text-neutral-400 text-xs uppercase">
                    <th className="p-4">日期</th>
                    <th className="p-4">描述項目</th>
                    <th className="p-4 text-right">金額</th>
                    <th className="p-4">備註 (自動儲存)</th>
                    <th className="p-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-neutral-50/80">
                      <td className="p-4 whitespace-nowrap text-neutral-500">{t.date}</td>
                      <td className="p-4">
                        <div className="font-medium text-neutral-900">{t.description}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">{t.type}</div>
                      </td>
                      <td className="p-4 text-right font-semibold whitespace-nowrap">
                        {t.income > 0 ? <span className="text-emerald-600">+${t.income.toLocaleString()}</span> : <span>${t.expense.toLocaleString()}</span>}
                      </td>
                      <td className="p-4 min-w-[200px]">
                        <input 
                          type="text" value={t.note} placeholder="新增備註..."
                          onChange={(e) => handleNoteChange(t.id, e.target.value)}
                          className="w-full bg-neutral-50 border border-transparent focus:border-neutral-300 rounded px-2 py-1 outline-none"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(t.id)} className="text-neutral-300 hover:text-red-500 text-xs">刪除</button>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-neutral-400">當月無紀錄</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* ✨ PDF 匯入區塊 */}
            <div className="bg-white p-6 rounded-xl border shadow-sm border-dashed border-2 border-neutral-200">
              <h3 className="font-semibold text-neutral-900 mb-2 text-sm">📑 自動匯入銀行 PDF 明細</h3>
              <p className="text-xs text-neutral-400 mb-4">支援自動抓取日期、分類與金額，並過濾重複紀錄。</p>
              
              <div className="border border-dashed border-neutral-300 rounded-lg p-6 text-center hover:bg-neutral-50 transition-colors">
                {isUploading ? (
                  <span className="text-xs text-blue-500 font-medium">⏳ 檔案解析中，請稍候...</span>
                ) : (
                  <>
                    <span className="text-xs text-neutral-400 block mb-1">📁 點擊下方按鈕上傳富邦明細</span>
                    <input type="file" accept=".pdf" className="hidden" id="pdf-uploader" onChange={handleFileUpload} />
                    <label htmlFor="pdf-uploader" className="mt-3 inline-block bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded text-xs font-medium cursor-pointer transition-all">選擇 PDF 檔案</label>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-4 text-sm">➕ 手動新增紀錄</h3>
              <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
                <input type="date" value={newRow.date} onChange={e => setNewRow({...newRow, date: e.target.value})} className="w-full p-2 border rounded-lg outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={newRow.category} onChange={e => setNewRow({...newRow, category: e.target.value, type: e.target.value === 'Credit Card' ? '刷卡消費' : e.target.value === 'Income' ? 'CD轉收' : '行動跨轉'})} className="w-full p-2 border rounded-lg bg-white">
                    <option value="Credit Card">信用卡消費</option>
                    <option value="Income">進帳</option>
                    <option value="Transfer/Withdrawal">轉帳/提款</option>
                  </select>
                  <input type="text" value={newRow.type} onChange={e => setNewRow({...newRow, type: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <input type="text" placeholder="商家或活動" value={newRow.description} onChange={e => setNewRow({...newRow, description: e.target.value})} className="w-full p-2 border rounded-lg outline-none" />
                <input type="number" value={newRow.category === 'Income' ? newRow.income : newRow.expense} onChange={e => setNewRow(newRow.category === 'Income' ? {...newRow, income: Number(e.target.value)} : {...newRow, expense: Number(e.target.value)})} className="w-full p-2 border rounded-lg outline-none" />
                <button type="submit" className="w-full bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-medium p-2.5 rounded-lg mt-2 transition-all">手動新增</button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}