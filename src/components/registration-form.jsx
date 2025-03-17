"use client";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AutoSearch } from "./ui/autoSearch";
import { maharashtraCities } from "./constants/city";

export function RegistrationForm({ className, heading, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col border-[0.1px] rounded-[15px] border-[#ff3445] gap-6",
        className
      )}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#cb202d] text-center">
            {heading}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details below for registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="phone">Whatsapp number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1234567890"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="phone">City</Label>
                <AutoSearch cities={maharashtraCities} />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-[#cb202d] text-white"
                >
                  Registration
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
