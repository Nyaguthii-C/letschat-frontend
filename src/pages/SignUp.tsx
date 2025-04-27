
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, Image } from "lucide-react";
import { postSignUp } from '@/api';

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  full_name: z.string().min(3, { message: "Full name must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  profile_photo: z.instanceof(File).optional(),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
    },
  });

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("profile_photo", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = async (data: SignUpFormValues) => {
    try {
      console.log("Form submitted:", data);
      
      // Create a FormData object
      const formData = new FormData();
      
      // Append the form fields to FormData
      formData.append('email', data.email);
      formData.append('full_name', data.full_name);
      formData.append('password', data.password);
      

      if (data.profile_photo) {
        formData.append('profile_photo', data.profile_photo);
      }
      
      const response = await postSignUp(formData);
      
      if (response.status === 201) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
        
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your account.",
        variant: "destructive",
      });
    }
  };
  
  


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create your account to start chatting</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex justify-center mb-4">
                <label htmlFor="profile_photo" className="cursor-pointer">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    {profilePhotoPreview ? (
                      <AvatarImage src={profilePhotoPreview} alt="Profile Preview" />
                    ) : (
                      <AvatarFallback className="bg-gray-200">
                        <Image className="h-12 w-12 text-gray-400" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    id="profile_photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePhotoChange}
                  />
                  <p className="text-sm text-center mt-2 text-muted-foreground">Click to upload photo</p>
                </label>
              </div>

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring bg-white">
                        <User className="ml-3 h-4 w-4 text-gray-400" />
                        <Input className="border-0 focus-visible:ring-0" placeholder="John Doe" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring bg-white">
                        <Mail className="ml-3 h-4 w-4 text-gray-400" />
                        <Input className="border-0 focus-visible:ring-0" placeholder="name@example.com" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring bg-white">
                        <Lock className="ml-3 h-4 w-4 text-gray-400" />
                        <Input className="border-0 focus-visible:ring-0" type="password" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium">Log in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;
