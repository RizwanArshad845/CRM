import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Save, Send, X } from 'lucide-react';
import { cls } from '../../styles/classes';
import { PRODUCTS, SERVICE_AREAS } from '../../data/mockData';
import { useClientInbox } from '../../context/ClientInboxContext';
import { useAuth } from '../../context/AuthContext';

type FormData = {
  companyName: string; customerName: string; paymentAmount: string;
  productSold: string; email: string; serviceArea: string;
  contactNo1: string; contactNo2: string;
  gbpLink: string; websiteLink: string; yelpLink: string;
  facebook: string; twitter: string; linkedin: string; instagram: string;
  clientConcerns: string; tipsForTech: string; notes: string;
};

const EMPTY_FORM: FormData = {
  companyName: '', customerName: '', paymentAmount: '', productSold: '',
  email: '', serviceArea: '', contactNo1: '', contactNo2: '', gbpLink: '',
  websiteLink: '', yelpLink: '', facebook: '', twitter: '',
  linkedin: '', instagram: '', clientConcerns: '', tipsForTech: '', notes: '',
};

const TEXT_AREAS: { id: keyof FormData; label: string; placeholder: string }[] = [
  { id: 'clientConcerns', label: 'Client Concerns', placeholder: 'Any specific concerns or requirements...' },
  { id: 'tipsForTech', label: 'Tips for Tech Team', placeholder: 'Important technical information...' },
  { id: 'notes', label: 'General Notes', placeholder: 'Any additional notes...' },
];

export function ClientEntryForm() {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const { addInboxClient } = useClientInbox();
  const { user } = useAuth();

  const set = (field: keyof FormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSaveDraft = () => toast.success('Draft saved successfully!');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.customerName || !formData.productSold) {
      toast.error('Please fill required fields (Company, Customer, Product)');
      return;
    }
    addInboxClient({
      companyName: formData.companyName,
      customerName: formData.customerName,
      paymentAmount: formData.paymentAmount,
      productSold: formData.productSold,
      email: formData.email,
      serviceArea: formData.serviceArea,
      contactNo1: formData.contactNo1,
      contactNo2: formData.contactNo2,
      clientConcerns: formData.clientConcerns,
      tipsForTech: formData.tipsForTech,
      notes: formData.notes,
      submittedBy: user?.name ?? 'Sales Agent',
    });
    toast.success('Client submitted to CST Manager inbox!');
    setFormData(EMPTY_FORM);
  };

  const handleClear = () => {
    if (confirm('Clear the form?')) {
      setFormData(EMPTY_FORM);
      toast.info('Form cleared');
    }
  };

  function Field({ id, label, type = 'text', required = false, placeholder = '' }: {
    id: keyof FormData; label: string; type?: string; required?: boolean; placeholder?: string;
  }) {
    return (
      <div className={cls.field}>
        <Label htmlFor={id}>{label}{required && ' *'}</Label>
        <Input id={id} type={type} required={required} placeholder={placeholder}
          value={formData[id]} onChange={e => set(id, e.target.value)} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Sales Information Entry for CST Team</CardTitle>
          <CardDescription>Enter client information and sales details</CardDescription>
        </CardHeader>
        <CardContent className={cls.page}>
          {/* Client Information */}
          <section className={cls.section}>
            <h3 className="font-semibold text-lg border-b pb-2">Client Information</h3>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
              <Field id="companyName" label="Company Name" required placeholder="ABC Corporation" />
              <Field id="customerName" label="Customer Name" required placeholder="John Doe" />
              <Field id="paymentAmount" label="Payment Amount ($)" type="number" required placeholder="5000" />
              <Field id="email" label="Email" type="email" required placeholder="contact@company.com" />
              <div className={cls.field}>
                <Label htmlFor="serviceArea">Service Area *</Label>
                <Select value={formData.serviceArea} onValueChange={v => set('serviceArea', v)}>
                  <SelectTrigger id="serviceArea"><SelectValue placeholder="Select service area" /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className={cls.field}>
                <Label htmlFor="productSold">Product / Category *</Label>
                <Select value={formData.productSold} onValueChange={v => set('productSold', v)}>
                  <SelectTrigger id="productSold"><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {PRODUCTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section className={cls.section}>
            <h3 className="font-semibold text-lg border-b pb-2">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field id="contactNo1" label="Contact No. 1 (Primary)" type="tel" required placeholder="+1 (555) 123-4567" />
              <Field id="contactNo2" label="Contact No. 2 (Secondary)" type="tel" placeholder="+1 (555) 987-6543" />
            </div>
          </section>

          {/* Digital Presence */}
          <section className={cls.section}>
            <h3 className="font-semibold text-lg border-b pb-2">Digital Presence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field id="websiteLink" label="Website" type="url" placeholder="https://www.company.com" />
              <Field id="gbpLink" label="Google Business Profile" type="url" placeholder="https://g.page/..." />
              <Field id="yelpLink" label="Yelp" type="url" placeholder="https://www.yelp.com/..." />
              <Field id="facebook" label="Facebook" type="url" placeholder="https://facebook.com/..." />
              <Field id="twitter" label="Twitter/X" type="url" placeholder="https://twitter.com/..." />
              <Field id="linkedin" label="LinkedIn" type="url" placeholder="https://linkedin.com/..." />
              <Field id="instagram" label="Instagram" type="url" placeholder="https://instagram.com/..." />
            </div>
          </section>

          {/* Additional Information */}
          <section className={cls.section}>
            <h3 className="font-semibold text-lg border-b pb-2">Additional Information</h3>
            {TEXT_AREAS.map(({ id, label, placeholder }) => (
              <div key={id} className={cls.field}>
                <Label htmlFor={id}>{label}</Label>
                <Textarea id={id} rows={3} placeholder={placeholder}
                  value={formData[id]} onChange={e => set(id, e.target.value)} />
              </div>
            ))}
          </section>

          {/* Actions */}
          <div className={`${cls.actions} pt-4`}>
            <Button type="button" variant="outline" onClick={handleSaveDraft} className="flex-1">
              <Save className="h-4 w-4 mr-2" />Save Draft
            </Button>
            <Button type="submit" className="flex-1">
              <Send className="h-4 w-4 mr-2" />Submit for Review
            </Button>
            <Button type="button" variant="destructive" onClick={handleClear}>
              <X className="h-4 w-4 mr-2" />Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
