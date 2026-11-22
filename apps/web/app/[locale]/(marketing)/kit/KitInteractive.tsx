'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Search, Send, Trash2, User } from 'lucide-react';
import { Button, Checkbox, FormField, Input, Modal, Select, Textarea } from '@/components/ui';
import FAQAccordion from '@/components/ui/FAQAccordion';

/* Interactive part of the /kit gallery: a validated form (inline errors, noValidate), a modal, the
   accordion. Sample copy is Azerbaijani on purpose (shows ə ğ ı İ ş ç ö ü in every face). */
const schema = z.object({
  name: z.string().trim().min(2, 'Ad ən azı 2 hərf olmalıdır'),
  email: z.string().trim().email('Düzgün e-poçt ünvanı daxil edin'),
  course: z.string().min(1, 'Kurs seçin'),
  message: z.string().trim().min(10, 'Mesaj ən azı 10 simvol olmalıdır'),
});

export default function KitInteractive() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form noValidate onSubmit={handleSubmit(() => setOpen(true))} className="card-paper space-y-5 p-6 sm:p-8" id="kit-form">
        <FormField label="Ad Soyad" error={errors.name?.message} required>
          <Input icon={User} placeholder="Aygün Şirinova" autoComplete="name" {...register('name')} />
        </FormField>
        <FormField label="E-poçt" error={errors.email?.message} hint="Cavabı bu ünvana göndərəcəyik" required>
          <Input icon={Mail} type="email" placeholder="ad@numune.az" {...register('email')} />
        </FormField>
        <FormField label="Kurs" error={errors.course?.message} required>
          <Select defaultValue="" {...register('course')}>
            <option value="" disabled>
              Seçin…
            </option>
            <option value="frontend">Front-end proqramlaşdırma</option>
            <option value="design">UI/UX dizayn</option>
          </Select>
        </FormField>
        <FormField label="Mesaj" error={errors.message?.message}>
          <Textarea rows={4} placeholder="Sualınızı yazın…" {...register('message')} />
        </FormField>
        <Checkbox label="Yeniliklərə abunə olmaq istəyirəm" defaultChecked />
        <FormField label="Axtarış (disabled)">
          <Input icon={Search} placeholder="Deaktiv sahə" disabled />
        </FormField>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" icon={Send}>
            Göndər
          </Button>
          <Button variant="ghost" onClick={() => setOpen(true)}>
            Modalı aç
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        <FAQAccordion
          locale="az"
          items={[
            {
              id: 'a',
              question: { az: 'Nümunə sual: açıq vəziyyət' },
              answer: { az: 'Cavab mətninin nümunəsi — Azərbaycan hərfləri: ə Ə ğ Ğ ı İ ş Ş ç Ç ö Ö ü Ü.' },
            },
            {
              id: 'b',
              question: { az: 'Nümunə sual: bağlı vəziyyət' },
              answer: { az: 'İkinci cavabın nümunə mətni.' },
            },
            {
              id: 'c',
              question: { az: 'Uzun sual nümunəsi: sətir sığmayanda mətn necə bükülür və ikon yerində qalırmı?' },
              answer: { az: 'Üçüncü cavabın nümunə mətni.' },
            },
          ]}
        />
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Müraciət"
        entity="Front-end proqramlaşdırma"
        subtitle="Qısa forma"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Ləğv et
            </Button>
            <Button variant="danger" icon={Trash2} onClick={() => setOpen(false)}>
              Sil
            </Button>
            <Button onClick={() => setOpen(false)}>Təsdiqlə</Button>
          </>
        }
      >
        <p className="text-ink-muted">
          Modal fokus tələsini saxlayır: Tab daxildə dövr edir, Escape bağlayır, fokus açan düyməyə qayıdır.
        </p>
        <FormField label="Telefon" className="mt-4">
          <Input type="tel" placeholder="+994 __ ___ __ __" />
        </FormField>
      </Modal>
    </div>
  );
}
