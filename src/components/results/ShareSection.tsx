"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2, Mail, Send } from "lucide-react";

type ShareSectionProps = {
  shareText: string;
  shareTextShort: string;
  shareUrl: string;
};

export function ShareSection({ shareText, shareTextShort, shareUrl }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: "優待アプリ - 私の優待ポートフォリオ",
        text: shareTextShort,
        url: shareUrl,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("シェア失敗:", err);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("コピー失敗:", err);
      alert("コピーに失敗しました。お使いのブラウザがクリップボードAPIに対応していない可能性があります。");
    }
  };

  const text = encodeURIComponent(shareTextShort);
  const url = encodeURIComponent(shareUrl);

  const handleX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleLINE = () => {
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareTextShort + "\n" + shareUrl)}`, "_blank");
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, "_blank");
  };

  const handleThreads = () => {
    window.open(`https://www.threads.net/intent/post?text=${text}%0A${url}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("優待アプリで見つけた優待ポートフォリオ");
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">この結果を保存・シェアする</h3>

      {/* スマホ向け: ネイティブシェアボタン */}
      {canNativeShare && (
        <Button onClick={handleNativeShare} size="lg" className="w-full gap-2">
          <Share2 className="w-4 h-4" />
          シェアする(LINE・X・Instagram等)
        </Button>
      )}

      {/* テキストコピー(全環境共通) */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="w-full gap-1.5"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span>テキストをコピー済み</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>テキストでコピー(メモ・LINE等)</span>
          </>
        )}
      </Button>

      {/* PC向け: 個別SNSボタン */}
      {!canNativeShare && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">SNSでシェア</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleX} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span className="text-xs">X (Twitter)</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLINE} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span className="text-xs">LINE</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleFacebook} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleThreads} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span className="text-xs">Threads</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail} className="col-span-2 gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span className="text-xs">メール</span>
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
        💡 スクショで保存して家計簿アプリに貼り付けるのもおすすめ
      </p>
    </section>
  );
}
