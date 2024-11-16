"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Github, Instagram, Linkedin, Twitter, Upload } from "lucide-react";
import { useState } from "react";

export default function UserProfileEdit() {
  const [coverImage, setCoverImage] = useState(
    "/placeholder.svg?height=200&width=800"
  );
  const [profileImage, setProfileImage] = useState(
    "/placeholder.svg?height=200&width=200"
  );
  const [formErrors, setFormErrors] = useState<any>({
    username: "",
    displayName: "",
    description: "",
    twitter: "",
    instagram: "",
    github: "",
    linkedin: "",
  });

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: (value: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newErrors = { ...formErrors };
    let hasError = false;

    Object.keys(formErrors).forEach((key) => {
      if (!formData.get(key)) {
        newErrors[key] = "This field is required*";
        hasError = true;
      } else {
        newErrors[key] = "";
      }
    });

    setFormErrors(newErrors);

    if (!hasError) {
      console.log("Form submitted successfully");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Edit Your Profile
        </h1>

        <Card className="bg-zinc-800 border-none mb-8 pb-12 pt-3">
          <CardContent className="space-y-4 pt-4 pb-6">
            <div className="relative">
              <motion.div
                className="relative h-48 rounded-lg overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <Label
                  htmlFor="cover-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-white" />
                </Label>
                <Input
                  id="cover-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setCoverImage)}
                  accept="image/*"
                />
              </motion.div>
              <motion.div
                className="absolute left-3 bottom-0 transform translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <Label
                    htmlFor="profile-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </Label>
                  <Input
                    id="profile-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setProfileImage)}
                    accept="image/*"
                  />
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-none text-white">
          <CardContent className="pt-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  className="bg-zinc-700 border-zinc-600 text-zinc-100"
                  
                />
                {formErrors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.username}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="displayName"
                  name="displayName"
                  className="bg-zinc-700 border-zinc-600 text-zinc-100"
                  
                />
                {formErrors.displayName && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.displayName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  className="bg-zinc-700 border-zinc-600 text-zinc-100"
                  rows={4}
                  
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Social Media Links <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Twitter className="w-5 h-5 text-zinc-400" />
                    <Input
                      placeholder="Twitter"
                      name="twitter"
                      className="bg-zinc-700 border-zinc-600 text-zinc-100"
                      
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Instagram className="w-5 h-5 text-zinc-400" />
                    <Input
                      placeholder="Instagram"
                      name="instagram"
                      className="bg-zinc-700 border-zinc-600 text-zinc-100"
                      
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Github className="w-5 h-5 text-zinc-400" />
                    <Input
                      placeholder="GitHub"
                      name="github"
                      className="bg-zinc-700 border-zinc-600 text-zinc-100"
                      
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-5 h-5 text-zinc-400" />
                    <Input
                      placeholder="LinkedIn"
                      name="linkedin"
                      className="bg-zinc-700 border-zinc-600 text-zinc-100"
                      
                    />
                  </div>
                </div>
                {(formErrors.twitter ||
                  formErrors.instagram ||
                  formErrors.github ||
                  formErrors.linkedin) && (
                  <p className="text-red-500 text-sm mt-1">
                    All social media links are 
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full text-white"
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
