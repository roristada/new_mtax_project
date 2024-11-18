"use client";

import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import Navbar from "../../../components/Navbar";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useLocale ,  useTranslations } from "next-intl";


export default function Login() {
  const t = useTranslations("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [router, status]);

  const handleSubmit = async (e: any) => {
    e.preventDefault(); 
    setLoading(true); 
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      setLoading(false);
      if (result?.error) {
        console.error(result.error);
        setError(
          result.error.includes("Credentials")
            ? t("invalidCredentials")
            : t("unexpectedError")
        );
        Swal.fire({
          icon: "error",
          title: t("loginError"),
          text: t("invalidCredentials"),
        });
      } else {
        router.push("/"); 
      }
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: t("loginError"),
        text: t("unexpectedError"),
      }); 
    }
  };

  return (
    <>
      <Navbar></Navbar>
      <div className="flex min-h-[80dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-6 border p-12 rounded-lg shadow-md">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("password")}</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("loggingIn") : t("login")}
              </Button>
            </div>
          </form>

          <Link className="text-sm text-muted-foreground hover:underline" href={`/${locale}/resetpassword`}>
            {t("resetPassword")}
          </Link>
        </div>
      </div>
    </>
  );
}
