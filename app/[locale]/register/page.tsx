"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import Swal from "sweetalert2";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export default function Register() {
  const t = useTranslations('Register');
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirm_password: "",
    address: "",
    telephone: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, company, email, password, confirm_password, address, telephone, role } = formData;

    if (!validateEmail(email)) {
      setError(t('errors.invalidEmail'));
      return;
    }

    if (!validatePassword(password)) {
      setError(t('errors.invalidPassword'));
      return;
    }

    if (password !== confirm_password) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch(`/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, company, email, password, confirm_password, address, telephone, role }),
    });

    if (!res.ok) {
      setLoading(false);
      const { error } = await res.json();
      setError(error || "Registration failed");
      return;
    }

    const data = await res.json();
    console.log(data);

    Swal.fire({
      title: t('success.title'),
      text: t('success.message'),
      icon: "success",
    }).then(() => {
      setLoading(false);
      router.push("/dashboard/admin");
    });
  };

  return (
    <>
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-lg space-y-6 border rounded-lg shadow-lg p-12">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('fields.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('placeholders.name')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">{t('fields.company')}</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder={t('placeholders.company')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('placeholders.email')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('fields.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">{t('fields.confirmPassword')}</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('fields.address')}</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">{t('fields.telephone')}</Label>
                <div className="flex justify-between gap-8">
                  <Input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                  />
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('fields.role')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t('fields.role')}</SelectLabel>
                        <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                        <SelectItem value="customer">{t('roles.customer')}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('buttons.registering') : t('buttons.register')}
              </Button>
            </div>
            {error && <p className="text-red-500 mt-6">{error}</p>}
          </form>
        </div>
      </div>
    </>
  );
}