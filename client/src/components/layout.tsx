import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Menu } from "lucide-react";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffe5] text-[#662506] font-sans">
      <header className="sticky top-0 z-50 w-full bg-[#ffffe5]/80 backdrop-blur-md border-b border-[#cc4c02]/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 group">
              <div className="bg-[#ec7014] p-1.5 rounded-full text-white group-hover:rotate-12 transition-transform">
                <Sparkles size={20} />
              </div>
              <span className="font-serif text-xl font-bold tracking-wide text-[#993404]">JAKARTA BEAUTY SCHOOL</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-[#993404]">
            <Link href="/"><a className="hover:text-[#ec7014] transition-colors">Home</a></Link>
            <Link href="/#classes"><a className="hover:text-[#ec7014] transition-colors">Classes</a></Link>
            <Link href="/#about"><a className="hover:text-[#ec7014] transition-colors">About</a></Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden sm:inline-block">Hello, {user.name}</span>
                <Link href="/history">
                  <Button variant="ghost" className="text-[#993404] hover:text-[#ec7014] hover:bg-[#fec44f]/20">
                    My Classes
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={logout}
                  className="border-[#cc4c02] text-[#cc4c02] hover:bg-[#cc4c02]/10"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="bg-[#ec7014] hover:bg-[#cc4c02] text-white font-medium shadow-md hover:shadow-lg transition-all">
                  Sign In / Sign Up
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#662506]">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#ffffe5] border-l border-[#fee391]">
                <div className="flex flex-col gap-6 mt-8">
                  <nav className="flex flex-col gap-4 font-medium text-[#993404] text-lg">
                    <Link href="/" onClick={() => setIsOpen(false)}><a className="hover:text-[#ec7014] transition-colors">Home</a></Link>
                    <Link href="/#classes" onClick={() => setIsOpen(false)}><a className="hover:text-[#ec7014] transition-colors">Classes</a></Link>
                    <Link href="/#about" onClick={() => setIsOpen(false)}><a className="hover:text-[#ec7014] transition-colors">About</a></Link>
                  </nav>
                  <div className="h-px bg-[#fee391] w-full" />
                  <div className="flex flex-col gap-4">
                    {user ? (
                      <>
                        <span className="text-sm font-medium text-[#662506]">Signed in as {user.name}</span>
                        <Link href="/history" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-[#993404] hover:text-[#ec7014] hover:bg-[#fec44f]/20 pl-0">
                            My Classes
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          onClick={() => { logout(); setIsOpen(false); }}
                          className="w-full border-[#cc4c02] text-[#cc4c02] hover:bg-[#cc4c02]/10"
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Link href="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-[#ec7014] hover:bg-[#cc4c02] text-white font-medium shadow-md">
                          Sign In / Sign Up
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-[#662506] text-[#fff7bc] py-12 mt-20">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-[#fec44f]">JAKARTA BEAUTY SCHOOL</h3>
            <p className="text-[#fee391]/80 max-w-xs">
              Empowering beauty professionals with world-class training in makeup, nails, and lashes.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Contact</h4>
            <p className="text-[#fee391]/80">Jakarta, Indonesia</p>
            <p className="text-[#fee391]/80">+62 812 3456 7890</p>
            <p className="text-[#fee391]/80">info@jakartabeautyschool.com</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#ec7014] transition-colors">Instagram</a>
              <a href="#" className="hover:text-[#ec7014] transition-colors">TikTok</a>
              <a href="#" className="hover:text-[#ec7014] transition-colors">Facebook</a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-[#fff7bc]/20 text-center text-[#fee391]/60 text-sm">
          © 2024 Jakarta Beauty School. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
