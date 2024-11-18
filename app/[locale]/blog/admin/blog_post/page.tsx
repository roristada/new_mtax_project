"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../../../components/ui/card";
import { Label } from "../../../../../components/ui/label";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../../../components/ui/select";
import Navbar from "../../../../../components/Navbar";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Switch } from "../../../../../components/ui/switch";
import { Separator } from "../../../../../components/ui/separator";
import { useLocale, useTranslations } from 'next-intl';

const TextEditer = dynamic(() => import("../../../../../components/TextEditer/TextEditer"), {
  ssr: false,
});

interface FormData {
  title: string;
  author: string;
  content: string;
  email: string;
  category: string;
  picture: File | null;
  status: string; 
}

export default function Component() {
  const t = useTranslations('BlogManage');
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    content: "",
    email: "",
    category: "",
    picture: null, 
    status: "",
  });

  const [isPublished, setIsPublished] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push(`/${locale}/login`);
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          email: session?.user?.email,
          author: session?.user?.company,
        }));
      }
    } else if (status === "unauthenticated") {
      router.push(`/${locale}/login`);
    }
  }, [status, session, router]);

  const handleInputChange = (event: any) => {
    const { id, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      category: value,
    }));
  };

  const handlePictureChange = (event: any) => {
    const file = event.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      picture: file,
    }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    
    // Show loading state
    Swal.fire({
      title: t('submitting'),
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("author", formData.author);
    formDataToSend.append("content", content);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("status", formData.status);
    if (formData.picture) {
      formDataToSend.append("picture", formData.picture);
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/blog`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "บล็อกทำการโพสต์เรียบร้อย",
          icon: "success",
        }).then(() => {
          setLoading(false);
          router.push(`/${locale}/blog`);
        });
      } else {
        Swal.fire({
          title: "เกิดปัญหาในการโพสต์!",
          text: data.error,
          icon: "error",
        });
        setLoading(false);
      }
    } catch (error) {
      Swal.fire({
        title: "เกิดปัญหาในการโพสต์",
        text: "มีปัญหาบางอย่างเกิดขึ้นทำให้ไม่สามารถโพสต์ได้",
        icon: "error",
      });
      setLoading(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    setIsPublished(checked);
    setFormData((prevData) => ({
      ...prevData,
      status: checked ? "Published" : "Private", 
    }));
  };


  return (
    <Card className="w-full max-w-2xl mx-auto my-auto mt-20">
      <CardHeader>
        <CardTitle>{t('addPost')}</CardTitle>
        <CardDescription>
          {t('dialog.editDescription')}
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4"
        encType="multipart/form-data"
      >
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('dialog.fields.title')}</Label>
              <Input
                id="title"
                placeholder={t('dialog.fields.title')}
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">{t('tableHeaders.author')}</Label>
              <Input id="author" value={session?.user?.company} readOnly />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="picture">{t('dialog.fields.picture')}</Label>
            <Input id="picture" type="file" onChange={handlePictureChange} />
          </div>
          <div className="space-y-2 mt-5">
            <Label htmlFor="content">{t('dialog.fields.content')}</Label>
            <TextEditer
              value={content}
              onChange={(newContent: string) => {
                setContent(newContent);
              }}
            />
          </div>
          <div className="space-y-2 mt-5">
            <Label htmlFor="category">{t('dialog.fields.category')}</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={t('dialog.fields.category')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t.raw('categories')).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 mt-5 flex align-middle ">
            <Switch
              id="status"
              checked={isPublished}
              onCheckedChange={handleToggle}
            />
            <Label className="ml-2" htmlFor="status">
              {isPublished ? t('status.published') : t('status.private')}
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? t('submitting') : t('submit')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
