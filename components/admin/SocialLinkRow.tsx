import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { IconPicker } from "./IconPicker";
import { DeleteButton } from "../DeleteButton";

interface HomePageFormData {
  socialLinks: {
    platform: string;
    icon: string;
    href: string;
    label: string;
  }[];
}

interface SocialLinkRowProps {
  index: number;
  form: UseFormReturn<HomePageFormData>;
  onDelete: () => void;
}

export function SocialLinkRow({ index, form, onDelete }: SocialLinkRowProps) {
  return (
    <div className='p-4 border rounded-lg bg-glass-bg/10 flex gap-4 items-center'>
      <input
        type='hidden'
        {...form.register(`socialLinks.${index}.platform`)}
      />
      <input type='hidden' {...form.register(`socialLinks.${index}.label`)} />
      <FormField
        control={form.control}
        name={`socialLinks.${index}.icon`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <IconPicker
                value={field.value}
                onChange={({ icon, platform, label }) => {
                  field.onChange(icon);
                  form.setValue(`socialLinks.${index}.platform`, platform, {
                    shouldValidate: true,
                  });
                  form.setValue(`socialLinks.${index}.label`, label, {
                    shouldValidate: true,
                  });
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`socialLinks.${index}.href`}
        render={({ field }) => (
          <FormItem className='flex-1'>
            <FormControl>
              <div className='flex gap-2 items-center'>
                <Input
                  {...field}
                  placeholder={`Enter ${form.getValues(
                    `socialLinks.${index}.platform`
                  )} URL`}
                  className='h-10'
                />
                <DeleteButton onDelete={onDelete} title='Delete Social Link?' />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
