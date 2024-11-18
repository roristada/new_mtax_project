"use client";

import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { User } from "@prisma/client";
import { useSession, getSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      const fetchUser = async () => {
        const res = await fetch(`/api/profile/${session?.user.id}`);
        const data = await res.json();
        setUser(data);
      };

      fetchUser();
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }, [session]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`/api/profile/${session?.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error.includes("อีเมล")) {
          await Swal.fire({
            title: "อีเมลซ้ำ",
            text: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น",
            icon: "error",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#3085d6",
          });
        } else if (data.error.includes("บริษัท")) {
          await Swal.fire({
            title: "ชื่อบริษัทซ้ำ",
            text: "ชื่อบริษัทนี้ถูกใช้งานแล้ว กรุณาใช้ชื่อบริษัทอื่น",
            icon: "error",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#3085d6",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setUser(data);
      setIsEditing(false);

      await update({
        ...session,
        user: {
          ...session?.user,
          ...formData,
        },
      });

      router.refresh();

      await Swal.fire({
        title: "สำเร็จ",
        text: "อัพเดทข้อมูลเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการอัพเดทข้อมูล",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openEditModal = () => {
    setFormData({
      name: user?.name,
      email: user?.email,
      role: user?.role,
      company: user?.company,
      address: user?.address,
      telephone: user?.telephone,
    });
    setIsEditing(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ข้อมูลโปรไฟล์</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={openEditModal}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          แก้ไขข้อมูล
        </Button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileField label="ชื่อ" value={user?.name} />
          <ProfileField label="อีเมล" value={user?.email} />
          <ProfileField label="ตำแหน่ง" value={user?.role} />
          <ProfileField label="บริษัท" value={user?.company} />
          <ProfileField label="ที่อยู่" value={user?.address} />
          <ProfileField label="เบอร์โทรศัพท์" value={user?.telephone} />
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">แก้ไขข้อมูล</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  ชื่อ
                </Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  อีเมล
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  readOnly
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  บริษัท
                </Label>
                <Input
                  type="text"
                  name="company"
                  value={formData.company || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  ที่อยู่
                </Label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  type="tel"
                  name="telephone"
                  value={formData.telephone || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  บันทึก
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value || "-"}</p>
    </div>
  );
}
