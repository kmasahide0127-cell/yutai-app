"use client";

import { useState } from "react";
import { Copy, Check, Mail } from "lucide-react";

type ShareSectionProps = {
  shareText: string;
  shareTextShort: string;
  shareUrl: string;
};

export function ShareSection({ shareText, shareTextShort, shareUrl }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);

  const handleCopy = async (text: string, setStateFn: (v: boolean) => void) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // フォールバック: execCommand(古いブラウザ・http環境)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setStateFn(true);
      setTimeout(() => setStateFn(false), 2000);
    } catch (err) {
      console.error("コピー失敗:", err);
      alert("コピーに失敗しました。長押しでテキストを選択してください。");
    }
  };

  const text = encodeURIComponent(shareTextShort);
  const url = encodeURIComponent(shareUrl);
  const textWithUrl = encodeURIComponent(shareTextShort + "\n" + shareUrl);

  const openLINE = () => {
    window.open(`https://line.me/R/msg/text/?${textWithUrl}`, "_blank", "noopener,noreferrer");
  };

  const openX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  const openFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, "_blank", "noopener,noreferrer");
  };

  const openInstagram = async () => {
    await handleCopy(shareText, setIgCopied);
    alert("テキストをコピーしました。Instagramのストーリーやメッセージに貼り付けてください。");
  };

  const openEmail = () => {
    const subject = encodeURIComponent("優待アプリで見つけた優待ポートフォリオ");
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const buttonClass = "flex flex-col items-center gap-1.5 rounded-lg p-1.5 sm:p-2 min-h-[80px] transition-all active:scale-95 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const iconWrapClass = "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-white shrink-0";
  const labelClass = "text-[10px] font-medium whitespace-nowrap";

  return (
    <section className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">この結果を友達にシェア</h3>
        <p className="text-xs text-muted-foreground mt-1">
          下のアイコンをタップすると、各アプリで共有できます
        </p>
      </div>

      {/* SNSアイコン群 - 公式ロゴカラー */}
      <div className="grid grid-cols-5 gap-0.5 xs:gap-1 sm:gap-2">
        {/* LINE */}
        <button onClick={openLINE} className={buttonClass} aria-label="LINEで送る">
          <div className={iconWrapClass} style={{ backgroundColor: "#06C755" }}>
            <svg viewBox="0 0 36 36" fill="currentColor" className="w-8 h-8">
              <path d="M30.95 14.5c0-5.84-5.86-10.6-13.05-10.6S4.85 8.66 4.85 14.5c0 5.24 4.65 9.62 10.93 10.45.43.09 1 .28 1.15.65.13.34.09.86.04 1.2 0 0-.15.93-.19 1.13-.06.34-.27 1.32 1.16.72 1.43-.6 7.7-4.53 10.51-7.76C30.39 18.78 30.95 16.71 30.95 14.5z M12 11.5h1.5v6H17v1.5h-5v-7.5z M19 11.5h1.5v7.5H19v-7.5z M27.5 11.5H29v1.5h-3.5v1.5h3v1.5h-3v1.5H29V19h-5v-7.5h3.5z M23 11.5h1.5l-3 7.5h-1.5l-3-7.5h1.5l1.75 4.5z"/>
            </svg>
          </div>
          <span className={labelClass}>LINE</span>
        </button>

        {/* X (Twitter) */}
        <button onClick={openX} className={buttonClass} aria-label="Xで投稿">
          <div className={iconWrapClass} style={{ backgroundColor: "#000000" }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <span className={labelClass}>X</span>
        </button>

        {/* Facebook */}
        <button onClick={openFacebook} className={buttonClass} aria-label="Facebookで共有">
          <div className={iconWrapClass} style={{ backgroundColor: "#1877F2" }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <span className={labelClass}>Facebook</span>
        </button>

        {/* Instagram - グラデーションをインラインstyleで明示 */}
        <button onClick={openInstagram} className={buttonClass} aria-label="Instagramへ(テキストをコピー)">
          <div
            className={iconWrapClass}
            style={{
              background: "linear-gradient(135deg, #feda75 0%, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)"
            }}
          >
            {igCopied ? (
              <Check className="w-7 h-7" />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            )}
          </div>
          <span className={labelClass}>{igCopied ? "コピー済" : "Instagram"}</span>
        </button>

        {/* メール */}
        <button onClick={openEmail} className={buttonClass} aria-label="メールで送る">
          <div className={iconWrapClass} style={{ backgroundColor: "#737373" }}>
            <Mail className="w-7 h-7" />
          </div>
          <span className={labelClass}>メール</span>
        </button>
      </div>

      {/* テキストコピー(フォールバック) */}
      <div className="pt-3 border-t border-border">
        <button
          onClick={() => handleCopy(shareText, setCopied)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-3 text-sm transition-all active:scale-[0.98] hover:bg-muted/50 min-h-[44px]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>コピー済み</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 shrink-0" />
              <span>テキストをコピー(メモ・他アプリ用)</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        💡 スクショで保存して家計簿アプリに貼り付けるのもおすすめ
      </p>
    </section>
  );
}
