import BlogNicknameGate from "@/components/BlogNicknameGate";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="blog-wood-shell min-h-screen">
      <BlogNicknameGate>{children}</BlogNicknameGate>
    </div>
  );
}
