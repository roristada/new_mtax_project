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
#------------------------------------------------------------------------------------------------#

# FROM node:18-alpine

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install --production

# # Copy the rest of the project files
# COPY . .

# # Build the Next.js app
# RUN npm run build

# # Expose port 3000
# EXPOSE 3000

# # Start the app in production mode
# CMD ["npm", "start"]
