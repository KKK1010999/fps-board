"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PostItem from "@/components/PostItem";

type Post = any; 

// A8.net 広告バナー（収益源）
const ADS_BANNER = {
  title: "PING値を下げろ",
  text: "勝てない原因は回線かも？FPS専用「高速回線」をチェック",
  url: "https://px.a8.net/svt/ejp?a8mat=45KRG0+BQPSAA+3SPO+CKJSMQ", 
  color: "bg-gradient-to-r from-slate-800 to-slate-900 border border-cyan-500/30"
};

// Amazon おすすめデバイス（収益源）
const RECOMMEND_ITEMS = [
  { id: 1, name: "G703h LIGHTSPEED", price: "¥9,000", img: "🖱️", desc: "最強の定番マウス", url: "https://amzn.to/4jnuadS" },
  { id: 2, name: "Razer BlackShark V2", price: "¥6,000", img: "🎧", desc: "足音が超聞こえる", url: "https://amzn.to/48ZO2Af" },
  { id: 3, name: "Logicool G PRO", price: "¥1,5000", img: "⌨️", desc: "反応爆速キーボード", url: "https://amzn.to/44SePvX" },
];

const GAME_RANKS: { [key: string]: string[] } = {
  "APEX": ["ルーキー", "ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "マスター", "プレデター"],
  "VALORANT": ["アイアン", "ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "アセンダント", "イモータル", "レディアント"],
  "OW2": ["ブロンズ", "シルバー", "ゴールド", "プラチナ", "ダイヤ", "マスター", "グランドマスター", "チャンピオン", "TOP500"],
};

const ID_TYPES = ["Discord", "Riot ID", "PSN ID", "Steam ID", "その他"];
const AVAILABLE_TAGS = [
  "初心者歓迎", "雰囲気重視", "怒らない人", "エンジョイ", "ガチ勢",
  "聞き専OK", "VC必須", "PC", "CS(PS5/Switch)", "クロスプレイ",
  "社会人限定", "学生OK", "20歳以上", "女子歓迎", "主婦/主夫",
  "ランクマ", "カジュアル/アンレ", "固定メンバー募集", "サブ垢", "キャリーして"
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // 入力用ステート
  const [inputGame, setInputGame] = useState("APEX");
  const [inputRank, setInputRank] = useState(GAME_RANKS["APEX"][0]);
  const [inputMessage, setInputMessage] = useState("");
  const [inputIdType, setInputIdType] = useState("Discord");
  const [inputContact, setInputContact] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [activeFilter, setActiveFilter] = useState("すべて");

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!error) setPosts(data || []);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddPost = async () => {
    if (!inputMessage || !inputContact) return alert("IDとメッセージを入力してください");
    
    const fullContact = `[${inputIdType}] ${inputContact}`;
    
    // DBに保存（履歴として残す）
    const { error } = await supabase.from('posts').insert([{
      game: inputGame, 
      rank: inputRank, 
      message: inputMessage, 
      contact_info: fullContact, 
      tags: selectedTags.length > 0 ? selectedTags : ["募集中"],
    }]);

    if (error) {
      alert("エラーが発生しました");
    } else {
      // ▼ ジェネレーターの本領発揮：タグ付きテキスト作成
      const tagText = selectedTags.map(t => `#${t}`).join(' '); 
      const gameTag = `#${inputGame}募集`; // 例: #APEX募集
      
      // X投稿用テキスト
      const text = `【${inputGame}】${inputRank}募集\n${tagText}\n\n「${inputMessage}」\n\n連絡先: ${inputContact} (${inputIdType})\n\n👇募集詳細・参加\n`;
      
      // URL生成
      const encodedText = encodeURIComponent(text);
      const myUrl = encodeURIComponent(window.location.href);
      setShareUrl(`https://twitter.com/intent/tweet?text=${encodedText}&url=${myUrl}&hashtags=FPS募集,${inputGame}募集`);
      
      await fetchPosts();
      setIsModalOpen(false);
      setInputMessage(""); setInputContact(""); setSelectedTags([]);
    }
  };

  const filteredPosts = activeFilter === "すべて" ? posts : posts.filter((p: any) => p.game === activeFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 font-sans">
      {/* ヘッダー：ツール名を強調 */}
      <header className="bg-slate-900/80 backdrop-blur-md p-4 sticky top-0 z-30 border-b border-slate-800 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter">
            FPS募集ジェネレーター
          </h1>
          <p className="text-[10px] text-slate-400">Xの募集ツイートを1秒で作成</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow-lg shadow-cyan-900/20">
          作成する ＋
        </button>
      </header>

      {/* ヒーローセクション：ツールの利便性をアピール */}
      <div className="p-5 text-center bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white mb-2">面倒な募集文、<br/>もう手打ちしてません？</h2>
        <p className="text-xs text-slate-400 mb-4">
          「社会人限定」「雰囲気重視」などのタグを選ぶだけで<br/>
          見やすい募集ツイートが一瞬で完成します。
        </p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full max-w-sm mx-auto py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-xl shadow-cyan-900/30 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <span>✍️</span> 今すぐ募集を作る（無料）
        </button>
      </div>

      {/* Xシェア完了モーダル */}
      {shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500 p-6 rounded-2xl shadow-2xl w-full max-w-sm relative text-center">
            <h3 className="text-lg font-bold text-white mb-2">文章を作成しました！</h3>
            <p className="text-xs text-slate-400 mb-6">下のボタンを押してXに投稿してください</p>
            
            <a 
              href={shareUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setShareUrl("")} 
              className="block w-full py-4 bg-[#1DA1F2] hover:bg-[#1a91da] text-white rounded-xl font-bold text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Xに投稿する
            </a>
            
            <button onClick={() => setShareUrl("")} className="mt-4 text-xs text-slate-500 underline">閉じる</button>
          </div>
        </div>
      )}

      {/* 広告エリア */}
      <a href={ADS_BANNER.url} target="_blank" className={`block mx-4 mt-6 p-4 rounded-xl ${ADS_BANNER.color} text-slate-200 shadow-lg group hover:border-cyan-500 transition relative overflow-hidden`}>
         <div className="flex items-center justify-between relative z-10">
          <div><div className="text-sm font-bold text-cyan-400">⚡️ {ADS_BANNER.title}</div><div className="text-[10px] text-slate-400 mt-1">{ADS_BANNER.text}</div></div>
          <div className="bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded text-[10px] font-bold border border-cyan-700">CHECK</div>
        </div>
      </a>

      {/* みんなの作成履歴（旧掲示板） */}
      <div className="mt-8">
        <div className="px-4 flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2">
            <span>🕒</span> みんなの作成履歴
          </h3>
          {/* フィルター */}
          <div className="flex gap-1">
            {["すべて", "APEX", "VALO"].map((tag) => (
              <button key={tag} onClick={() => setActiveFilter(tag === "VALO" ? "VALORANT" : tag)} className={`px-2 py-1 rounded text-[10px] font-bold ${activeFilter === (tag === "VALO" ? "VALORANT" : tag) ? "bg-slate-700 text-cyan-400" : "text-slate-600"}`}>{tag}</button>
            ))}
          </div>
        </div>

        <div className="px-4 space-y-3">
          {filteredPosts.length === 0 ? (
             <div className="text-center py-10 text-slate-600 text-xs">まだ履歴がありません。<br/>最初の投稿を作りましょう！</div>
          ) : (
            filteredPosts.map((post: any) => (
              <PostItem key={post.id} post={post} currentUserId={undefined} onDelete={fetchPosts} />
            ))
          )}
        </div>
      </div>

      {/* フッター固定の作成ボタン */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur p-3 border-t border-slate-800 z-20 flex justify-center">
         <button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white w-full max-w-md py-3 rounded-xl font-bold text-sm shadow-lg shadow-cyan-900/40">
           ＋ 募集ツイートを作成
         </button>
      </div>

      {/* 作成モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">募集を作成</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">ゲーム・ランク</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={inputGame} onChange={(e) => setInputGame(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">{Object.keys(GAME_RANKS).map(g => <option key={g} value={g}>{g}</option>)}</select>
                  <select value={inputRank} onChange={(e) => setInputRank(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm">{GAME_RANKS[inputGame].map(r => <option key={r} value={r}>{r}</option>)}</select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">条件タグ（タップで選択）</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700">
                  {AVAILABLE_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all ${selectedTags.includes(tag) ? "bg-cyan-600 border-cyan-400 text-white" : "bg-slate-800 border-slate-700 text-slate-500"}`}>{tag}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">ひとことメッセージ</label>
                <textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="例: @1 まったりやりましょう" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none h-20 resize-none" />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">自分のID（連絡先）</label>
                <div className="flex gap-2">
                  <select value={inputIdType} onChange={(e) => setInputIdType(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] w-24 font-bold">{ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  <input value={inputContact} onChange={(e) => setInputContact(e.target.value)} placeholder="Discord IDなどを入力" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-700 rounded-xl text-sm font-bold">キャンセル</button>
              <button onClick={handleAddPost} className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-sm font-bold text-white shadow-lg">作成してXへ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}