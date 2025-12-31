"use client";

export default function PostItem({ post }: { post: any, currentUserId: any, onDelete: any }) {
  // 時間の計算（簡易版）
  const time = new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-sm hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="bg-cyan-900/50 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-800">{post.game}</span>
          <span className="text-xs font-bold text-slate-200">{post.rank}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{time}</span>
      </div>

      <p className="text-sm text-slate-300 mb-3 leading-relaxed">{post.message}</p>

      {/* タグ表示 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {post.tags?.map((tag: string) => (
          <span key={tag} className="text-[9px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">#{tag}</span>
        ))}
      </div>

      {/* ID表示（ワンクッションなし） */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center group">
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Contact Info</span>
          <span className="text-xs text-cyan-100 font-mono break-all">{post.contact_info}</span>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(post.contact_info.split('] ')[1] || post.contact_info);
            alert("コピーしました！");
          }}
          className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
        >
          📋
        </button>
      </div>
    </div>
  );
}