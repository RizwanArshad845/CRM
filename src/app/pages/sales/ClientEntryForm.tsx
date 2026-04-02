import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { cls } from '../../styles/classes';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { PRODUCTS, SERVICE_AREAS } from '../../constants/crm';

const EMPTY_FORM = {
    companyName: '',
    customerName: '',
    paymentAmount: '',
    productSold: [] as string[],
    email: '',
    serviceArea: '',
    contactNo1: '',
    contactNo2: '',
    gbpLink: '',
    websiteLink: '',
    yelpLink: '',
    socialMedia: { facebook: '', twitter: '', linkedin: '', instagram: '' },
    clientConcerns: '',
    tipsForTech: '',
    notes: '',
};

export function ClientEntryForm() {
    const { user } = useAuth();
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));
    
    const handleProductToggle = (product: string) => {
        const current = [...form.productSold];
        const idx = current.indexOf(product);
        if (idx > -1) current.splice(idx, 1);
        else current.push(product);
        set('productSold', current);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.companyName || !form.email || !form.paymentAmount) {
            toast.error('Please fill in all required fields (*)');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await apiFetch('/clients', {
                method: 'POST',
                body: JSON.stringify({
                    companyName: form.companyName,
                    customerName: form.customerName,
                    email: form.email,
                    paymentAmount: parseFloat(form.paymentAmount),
                    productSold: form.productSold.join(', '),
                    serviceArea: form.serviceArea,
                    contactNo1: form.contactNo1,
                    contactNo2: form.contactNo2,
                    clientConcerns: form.clientConcerns,
                    tipsForTech: form.tipsForTech,
                    notes: form.notes,
                    digitalPresence: form.websiteLink || form.gbpLink || form.yelpLink,
                    sales_agent_id: user?.id
                })
            });

            if (res.success) {
                toast.success('Client submitted successfully!');
                setForm(EMPTY_FORM);
            } else {
                toast.error(res.error || 'Failed to submit client');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cls.page}>
            <Card className="max-w-4xl mx-auto shadow-xl border-t-4 border-t-blue-600">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">New Client Entry</CardTitle>
                    <CardDescription>Enter details for a newly closed deal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-muted/30 border border-muted-foreground/10">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Business Details</h3>
                            <div className={cls.field}>
                                <Label>Company Name *</Label>
                                <Input value={form.companyName} onChange={e => set('companyName', e.target.value)} required />
                            </div>
                            <div className={cls.field}>
                                <Label>Customer Name</Label>
                                <Input value={form.customerName} onChange={e => set('customerName', e.target.value)} />
                            </div>
                            <div className={cls.field}>
                                <Label>Email Address *</Label>
                                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">Deal Details</h3>
                            <div className={cls.field}>
                                <Label>Payment Amount (₨) *</Label>
                                <Input type="number" value={form.paymentAmount} onChange={e => set('paymentAmount', e.target.value)} required />
                            </div>
                            <div className={cls.field}>
                                <Label>Service Area</Label>
                                <Select value={form.serviceArea} onValueChange={v => set('serviceArea', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger>
                                    <SelectContent>
                                        {SERVICE_AREAS.map((a: string) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className={cls.field}>
                                <Label>Contact No.</Label>
                                <Input value={form.contactNo1} onChange={e => set('contactNo1', e.target.value)} placeholder="+1 234-567-8900" />
                            </div>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-4 p-6 rounded-xl border border-muted-foreground/10">
                        <h3 className="text-lg font-semibold border-b pb-2">Products Sold *</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {PRODUCTS.map((p: string) => (
                                <div key={p} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                    <Checkbox 
                                        id={`product-${p}`}
                                        checked={form.productSold.includes(p)} 
                                        onCheckedChange={() => handleProductToggle(p)}
                                    />
                                    <Label 
                                        htmlFor={`product-${p}`}
                                        className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                        {p}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Online Presence */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-xl bg-blue-50/10 border border-blue-500/10">
                        <div className={cls.field}>
                            <Label>GBP Link</Label>
                            <Input value={form.gbpLink} onChange={e => set('gbpLink', e.target.value)} placeholder="https://..." />
                        </div>
                        <div className={cls.field}>
                            <Label>Website Link</Label>
                            <Input value={form.websiteLink} onChange={e => set('websiteLink', e.target.value)} placeholder="https://..." />
                        </div>
                        <div className={cls.field}>
                            <Label>Yelp Link</Label>
                            <Input value={form.yelpLink} onChange={e => set('yelpLink', e.target.value)} placeholder="https://..." />
                        </div>
                    </div>

                    {/* Tech Notes */}
                    <div className="space-y-4 p-6 rounded-xl bg-orange-50/10 border border-orange-500/10">
                        <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">Technical Instructions</h3>
                        <div className={cls.field}>
                            <Label>Client Concerns</Label>
                            <Textarea value={form.clientConcerns} onChange={e => set('clientConcerns', e.target.value)} placeholder="What is the client worried about?" />
                        </div>
                        <div className={cls.field}>
                            <Label>Tips for the Tech Team</Label>
                            <Textarea value={form.tipsForTech} onChange={e => set('tipsForTech', e.target.value)} placeholder="Special instructions for execution..." />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" className="w-[200px] h-12 shadow-lg hover:scale-105 transition-transform" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Client'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
