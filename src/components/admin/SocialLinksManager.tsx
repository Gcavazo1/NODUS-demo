'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Trash2, Plus, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid'; // For generating temporary IDs

// Re-define SocialLink type locally or import from definitions if appropriate
interface SocialLink {
  id: string; 
  name: string;
  url: string;
  // Use specific category types to match AdminAppearance
  category?: 'social' | 'business' | 'other'; 
  isActive?: boolean;
}

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

interface ValidationError {
  type: 'name' | 'url';
  message: string;
}

// --- New Props Interface --- 
interface SocialLinksManagerProps {
    initialLinks: SocialLink[];
    onLinksChange: (newLinks: SocialLink[]) => void;
    disabled?: boolean;
}

export function SocialLinksManager({ 
    initialLinks, 
    onLinksChange, 
    disabled = false 
}: SocialLinksManagerProps) {
  // Removed context usage: const { socialLinks, isLoading, error: contextError } = useSocialLinks();
  
  // Local state for managing links being edited
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  // Sync with prop changes (e.g., after parent resets)
  useEffect(() => {
      setLinks(initialLinks);
  }, [initialLinks]);

  // Local state for the form and submission status
  const [isProcessing, setIsProcessing] = useState(false); // Renamed from isSubmitting
  const [newLink, setNewLink] = useState<Omit<SocialLink, 'id'>>({
    name: '',
    url: '',
    category: 'social',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<ValidationError[]>([]);

  // Validate form data against the current local links state
  const validateLink = useCallback((): boolean => {
    const newErrors: ValidationError[] = [];
    if (!newLink.name.trim()) {
      newErrors.push({ type: 'name', message: 'Name is required' });
    } else if (newLink.name.length > 30) {
      newErrors.push({ type: 'name', message: 'Name must be 30 characters or less' });
    }
    
    if (!newLink.url.trim()) {
      newErrors.push({ type: 'url', message: 'URL is required' });
    } else if (!URL_REGEX.test(newLink.url)) {
      newErrors.push({ type: 'url', message: 'Please enter a valid URL' });
    }
    
    // Check for duplicate names using the local `links` state
    if (newLink.name.trim() && links.some(link => 
        link.name.toLowerCase() === newLink.name.toLowerCase()
    )) {
      newErrors.push({ type: 'name', message: 'A link with this name already exists' });
    }
    
    // Check for duplicate URLs using the local `links` state
    const normalizedNewUrl = normalizeUrl(newLink.url);
    if (newLink.url.trim() && normalizedNewUrl && links.some(link => 
        normalizeUrl(link.url) === normalizedNewUrl
    )) {
      newErrors.push({ type: 'url', message: 'A link with this URL already exists' });
    }
    
    setFormErrors(newErrors);
    return newErrors.length === 0;
  }, [newLink, links]);
  
  const normalizeUrl = (url: string): string | null => {
     try {
       if (!url.trim()) return null;
       let normalizedUrl = url;
       if (!/^https?:\/\//i.test(normalizedUrl)) {
         normalizedUrl = 'https://' + normalizedUrl;
       }
       const urlObj = new URL(normalizedUrl);
       return (urlObj.host + urlObj.pathname).replace(/\/$/, '').toLowerCase();
     } catch {
       return url.toLowerCase();
     }
   };

  // --- DEMO MODE: Update local state and notify parent --- 
  const handleAddLink = () => {
    setFormErrors([]);
    if (!validateLink()) return;

    let url = newLink.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    setIsProcessing(true);
    const newLinkWithId: SocialLink = {
        ...newLink,
        url,
        id: uuidv4() // Generate a temporary unique ID
    };
    const updatedLinks = [...links, newLinkWithId];
    setLinks(updatedLinks); // Update local state
    onLinksChange(updatedLinks); // Notify parent
    
    setNewLink({ name: '', url: '', category: 'social', isActive: true }); // Reset form
    toast.success('Social link added (locally)');
    setIsProcessing(false); // Processing is synchronous now
  };

  const handleUpdateLink = (id: string, updatedData: Partial<Omit<SocialLink, 'id'>>) => {
    setIsProcessing(true);
    const updatedLinks = links.map(link => 
      link.id === id ? { ...link, ...updatedData } : link
    );
    setLinks(updatedLinks);
    onLinksChange(updatedLinks);
    toast.success('Social link updated (locally)');
    setIsProcessing(false);
  };

  const handleRemoveLink = (id: string) => {
    if (!confirm('Are you sure you want to remove this link (locally)?')) return;
    
    setIsProcessing(true);
    const updatedLinks = links.filter(link => link.id !== id);
    setLinks(updatedLinks);
    onLinksChange(updatedLinks);
    toast.success('Social link removed (locally)');
    setIsProcessing(false);
  };
  // --- End DEMO MODE Handlers ---

  // Get form error helper (remains the same)
  const getFieldError = (fieldType: 'name' | 'url'): string | null => {
    const fieldError = formErrors.find(err => err.type === fieldType);
    return fieldError ? fieldError.message : null;
  };

  // Use local `links` state for filtering
  const socialMediaLinks = links.filter(link => link.category === 'social' || !link.category);
  const businessLinks = links.filter(link => link.category === 'business');
  const otherLinks = links.filter(link => link.category === 'other');

  // Use passed `disabled` prop for disabling elements

  return (
    <div className="space-y-8">
      {/* Removed top-level Card as parent now provides it */}
      {/* Removed loading state check */}
      <div className="space-y-8">
          {/* Removed contextError display */}
          
          {/* Social Media Links Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Social Media</h3>
            <div className="space-y-4">
              {socialMediaLinks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No social media links added yet.</p>
              ) : (
                <div className="space-y-2">
                  {socialMediaLinks.map(link => (
                    <LinkItem 
                      key={link.id} 
                      link={link} 
                      onUpdate={handleUpdateLink}
                      onRemove={handleRemoveLink}
                      disabled={isProcessing || disabled} // Combine local processing with parent disabled state
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Business Links Section */}
          <div>
             <h3 className="text-lg font-medium mb-3">Business</h3>
             <div className="space-y-4">
                {businessLinks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No business links added yet.</p>
                 ) : (
                    <div className="space-y-2">
                       {businessLinks.map(link => (
                         <LinkItem 
                           key={link.id} 
                           link={link} 
                           onUpdate={handleUpdateLink}
                           onRemove={handleRemoveLink}
                           disabled={isProcessing || disabled}
                         />
                       ))}
                    </div>
                 )}
            </div>
          </div>
          
          {/* Other Links Section */}
          <div>
             <h3 className="text-lg font-medium mb-3">Other</h3>
              <div className="space-y-4">
                {otherLinks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No other links added yet.</p>
                 ) : (
                    <div className="space-y-2">
                       {otherLinks.map(link => (
                         <LinkItem 
                           key={link.id} 
                           link={link} 
                           onUpdate={handleUpdateLink}
                           onRemove={handleRemoveLink}
                           disabled={isProcessing || disabled}
                         />
                       ))}
                    </div>
                 )}
            </div>
          </div>
          
          {/* Add New Link Form */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">Add New Link</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Name Input */} 
              <div>
                 <Label htmlFor="linkName" className={getFieldError('name') ? 'text-destructive' : ''}>
                   Link Name
                 </Label>
                 <div className="mt-1">
                   <Input
                     id="linkName"
                     placeholder="e.g., LinkedIn, Portfolio"
                     value={newLink.name}
                     onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                     disabled={isProcessing || disabled}
                     className={getFieldError('name') ? 'border-destructive' : ''}
                   />
                   {getFieldError('name') && (
                     <p className="mt-1 text-xs text-destructive flex items-center">
                       <AlertCircle className="h-3 w-3 mr-1" />
                       {getFieldError('name')}
                     </p>
                   )}
                 </div>
               </div>
               {/* URL Input */} 
               <div>
                   <Label htmlFor="linkUrl" className={getFieldError('url') ? 'text-destructive' : ''}>
                     URL
                   </Label>
                   <div className="mt-1">
                     <Input
                       id="linkUrl"
                       placeholder="e.g., https://linkedin.com/in/yourprofile"
                       value={newLink.url}
                       onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                       disabled={isProcessing || disabled}
                       className={getFieldError('url') ? 'border-destructive' : ''}
                     />
                     {getFieldError('url') && (
                       <p className="mt-1 text-xs text-destructive flex items-center">
                         <AlertCircle className="h-3 w-3 mr-1" />
                         {getFieldError('url')}
                       </p>
                     )}
                   </div>
               </div>
               {/* Category Select */} 
               <div>
                   <Label htmlFor="linkCategory">Category</Label>
                   <Select
                     onValueChange={(value) => setNewLink({ ...newLink, category: value as 'social' | 'business' | 'other' })}
                     value={newLink.category}
                     disabled={isProcessing || disabled}
                   >
                     <SelectTrigger id="linkCategory">
                       <SelectValue placeholder="Select a category" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="social">Social Media</SelectItem>
                       <SelectItem value="business">Business</SelectItem>
                       <SelectItem value="other">Other</SelectItem>
                     </SelectContent>
                   </Select>
               </div>
                {/* Add Button */} 
               <div className="flex items-center space-x-2">
                 <Button 
                   onClick={handleAddLink}
                   disabled={isProcessing || disabled || !newLink.name || !newLink.url}
                 >
                   {isProcessing ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   ) : (
                     <Plus className="mr-2 h-4 w-4" />
                   )}
                   Add Link
                 </Button>
               </div>
             </div>
           </div>
         </div>
      {/* Removed CardFooter */}
    </div>
  );
}

// LinkItem component remains mostly the same, accepts disabled prop
interface LinkItemProps {
  link: SocialLink;
  onUpdate: (id: string, data: Partial<Omit<SocialLink, 'id'>>) => void; // Changed signature
  onRemove: (id: string) => void; // Changed signature
  disabled: boolean;
}

const LinkItem = ({ link, onUpdate, onRemove, disabled }: LinkItemProps) => {
  // ... (Implementation remains largely the same, ensure onUpdate/onRemove calls use the modified signatures)
  // Make sure Switch and Button inside LinkItem also respect the passed `disabled` prop.
  return (
     <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
       <div className="flex items-center flex-1 min-w-0">
         <div className="flex-1 min-w-0">
           <div className="flex items-center">
             <p className="font-medium truncate mr-2">{link.name}</p>
             <a 
               href={link.url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-muted-foreground/60 hover:text-primary"
             >
               <ExternalLink className="h-3 w-3" />
             </a>
           </div>
           <p className="text-xs text-muted-foreground truncate">{link.url}</p>
         </div>
       </div>
       
       <div className="flex items-center space-x-2 ml-4">
         <div className="flex items-center space-x-2">
           <Label htmlFor={`active-${link.id}`} className="text-xs sr-only">
             Active
           </Label>
           <Switch
             id={`active-${link.id}`}
             checked={link.isActive !== false}
             onCheckedChange={(checked) => onUpdate(link.id!, { isActive: checked })}
             disabled={disabled} // Use passed disabled prop
           />
         </div>
         
         <Button
           variant="ghost"
           size="icon"
           onClick={() => onRemove(link.id!)}
           disabled={disabled} // Use passed disabled prop
           className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
         >
           <Trash2 className="h-4 w-4" />
         </Button>
       </div>
     </div>
  );
}; 