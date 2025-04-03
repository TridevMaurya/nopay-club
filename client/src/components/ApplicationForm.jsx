var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
var formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().min(10, { message: "Please enter a valid phone number" }),
    resumeFile: z.instanceof(File, { message: "Please upload your resume" })
});
var ApplicationForm = function () {
    var toast = useToast().toast;
    var form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        }
    });
    var mutation = useMutation({
        mutationFn: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var formData;
            return __generator(this, function (_a) {
                formData = new FormData();
                formData.append("name", data.name);
                formData.append("email", data.email);
                formData.append("phone", data.phone);
                formData.append("resume", data.resumeFile);
                return [2 /*return*/, apiRequest("POST", "/api/internship/apply", data)];
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Application Submitted!",
                description: "We'll review your application and get back to you soon.",
                variant: "default",
            });
            form.reset();
        },
        onError: function (error) {
            toast({
                title: "Submission Failed",
                description: error.message || "Please try again later.",
                variant: "destructive",
            });
        }
    });
    var onSubmit = function (data) {
        mutation.mutate(data);
    };
    return (<motion.section className="py-12 px-4 md:px-12 relative z-10 mb-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.9 }}>
      <div className="container mx-auto max-w-3xl">
        <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple"></div>
          
          <motion.h2 className="font-space font-bold text-2xl md:text-3xl mb-6 text-center neon-text-blue" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1 }}>
            Apply for Internship
          </motion.h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField control={form.control} name="name" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel className="block text-text-light opacity-90 mb-1 font-space text-sm">Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full bg-space-blue border border-neon-blue/30 rounded-lg p-3 text-text-light focus:neon-border-blue outline-none transition-all" placeholder="Enter your full name"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                
                <FormField control={form.control} name="email" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel className="block text-text-light opacity-90 mb-1 font-space text-sm">Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="w-full bg-space-blue border border-neon-blue/30 rounded-lg p-3 text-text-light focus:neon-border-blue outline-none transition-all" placeholder="your.email@example.com"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                
                <FormField control={form.control} name="phone" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel className="block text-text-light opacity-90 mb-1 font-space text-sm">Contact Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="w-full bg-space-blue border border-neon-blue/30 rounded-lg p-3 text-text-light focus:neon-border-blue outline-none transition-all" placeholder="Enter your contact number"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                
                <FormField control={form.control} name="resumeFile" render={function (_a) {
            var _b = _a.field, onChange = _b.onChange, value = _b.value, rest = __rest(_b, ["onChange", "value"]);
            return (<FormItem>
                      <FormLabel className="block text-text-light opacity-90 mb-1 font-space text-sm">Resume/CV</FormLabel>
                      <div className="relative">
                        <input type="file" id="resume" onChange={function (e) {
                    var _a;
                    var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                    if (file) {
                        onChange(file);
                    }
                }} accept=".pdf,.doc,.docx" className="sr-only"/>
                        <label htmlFor="resume" className="flex items-center justify-center w-full bg-space-blue border border-dashed border-neon-purple/50 rounded-lg p-4 text-text-light cursor-pointer hover:bg-space-blue/80 transition-all">
                          <span className="text-neon-purple mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                            </svg>
                          </span>
                          <span>
                            {value instanceof File ? value.name : 'Click to upload your resume'}
                          </span>
                        </label>
                      </div>
                      <p className="text-xs text-text-light opacity-60 mt-1">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                      <FormMessage />
                    </FormItem>);
        }}/>
              </div>
              
              <div className="flex justify-center">
                <Button type="submit" disabled={mutation.isPending} className="neon-button-green rounded-lg py-3 px-8 font-space font-bold tracking-wider">
                  {mutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </motion.section>);
};
export default ApplicationForm;
