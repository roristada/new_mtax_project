import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface FormData {
  name: string;
  company: string;
  email: string;
  category: string;
  description: string;
}

export default function ProblemReportForm() {
  const { data: session } = useSession();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    company: "",
    email: "",
    category: "",
    description: "",
  });

  const route = useRouter();
  const t = useTranslations('ProblemReportForm');

  useEffect(() => {
    if (session) {
      setFormData((prevData) => ({
        ...prevData,
        company: session.user?.company || "",
        email: session.user?.email || "",
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    setFormData({
      name: "",
      company: "",
      email: "",
      category: "",
      description: "",
    });

    try {
      const res = await fetch(`/api/support/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: t('thankYouTitle'),
          text: t('thankYouText'),
        }).then(() => {
          route.push(`/dashboard/${session?.user?.id}`);
        });
      } else {
        console.log(res.text);
        Swal.fire({
          icon: "error",
          title: t('errorTitle'),
          text: t('errorText'),
        });
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: t('errorTitle'),
        text: t('errorText'),
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  return (
    <Card className="max-w-lg mx-auto border border-gray-300 rounded-lg shadow-lg p-6 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-semibold text-gray-800">
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('placeholders.name')}
              required
              value={formData.name}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">{t('company')}</Label>
            <Input
              id="company"
              type="text"
              placeholder={t('placeholders.company')}
              required
              value={formData.company}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('placeholders.email')}
              required
              value={formData.email}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t('category')}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prevData) => ({ ...prevData, category: value }))
              }
              required
            >
              <SelectTrigger
                id="category"
                className="border border-gray-300 rounded-md"
              >
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_problem">{t('categories.data_problem')}</SelectItem>
                <SelectItem value="dashboard_problem">{t('categories.dashboard_problem')}</SelectItem>
                <SelectItem value="appointment_problem">{t('categories.appointment_problem')}</SelectItem>
                <SelectItem value="feedback">{t('categories.feedback')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.category === "feedback" ? (
            <div className="space-y-2">
              <Label htmlFor="description">{t('yourQuestion')}</Label>
              <Textarea
                id="description"
                placeholder={t('enterQuestion')}
                value={formData.description}
                onChange={handleTextareaChange}
                className="border border-gray-300 rounded-md"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="description">{t('problemDescription')}</Label>
              <Textarea
                id="description"
                placeholder={t('describeProblem')}
                required
                value={formData.description}
                onChange={handleTextareaChange}
                className="border border-gray-300 rounded-md"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            {t('submitReport')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
