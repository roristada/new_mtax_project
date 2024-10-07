# เลือก base image
FROM node:18-alpine

# ตั้งค่า working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์ทั้งหมดในโปรเจ็กต์ไปยัง container
COPY . .

# เปิดพอร์ต 3000
EXPOSE 3000

# รันแอปพลิเคชัน
CMD ["npm", "run" , "dev"]
