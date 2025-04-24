"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
// Remove context import: import { useSocialLinks } from '@/context/SocialLinksContext';

// --- DEMO MODE --- 
// Ensure LOCAL_STORAGE_KEY and SocialLink type are defined/imported if not globally available
const LOCAL_STORAGE_KEY = 'demoAdminSettings';

// Define SocialLink type locally if not imported from a shared location
interface SocialLink {
  id: string;
  name: string;
  url: string;
  category?: 'social' | 'business' | 'other';
  isActive?: boolean;
}

// Helper to safely parse JSON and get links
const getLinksFromLS = (): SocialLink[] | null => {
    console.log("[Footer Debug] getLinksFromLS called.");
    const storedSettings = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null; // Check for window
    console.log("[Footer Debug] Raw LS data:", storedSettings);
    if (!storedSettings) {
        console.log("[Footer Debug] No settings in LS.");
        return null;
    }
    try {
        const parsed = JSON.parse(storedSettings);
        console.log("[Footer Debug] Parsed LS data:", parsed);
        // Validate structure
        if (parsed && Array.isArray(parsed.socialLinks)) {
            // Filter for active links during parsing
            const activeLinks = (parsed.socialLinks as SocialLink[]).filter(link => link?.isActive !== false && link?.id);
            console.log("[Footer Debug] Found and filtered valid socialLinks array:", activeLinks);
            return activeLinks;
        } else {
            console.warn("[Footer Debug] Parsed LS data missing or invalid socialLinks array.");
            return null;
        }
    } catch (e) {
        console.error("[Footer Debug] Error parsing settings from Local Storage:", e);
        return null;
    }
};
// --- End DEMO MODE --- 

export function Footer() {
  const [footerLinks, setFooterLinks] = useState<SocialLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [errorLoadingLinks, setErrorLoadingLinks] = useState<string | null>(null);

  // Remove context usage:
  // const { socialLinks, isLoading, error: isError } = useSocialLinks();

  // Load links from Local Storage on mount
  useEffect(() => {
      setIsLoadingLinks(true);
      setErrorLoadingLinks(null);
      console.log("[Footer Debug] Starting initial link load effect..."); 
      try {
          const links = getLinksFromLS();
          if (links) {
              setFooterLinks(links);
              console.log("[Footer Debug] Successfully set links from LS (initial load)"); 
          } else {
              setFooterLinks([]);
              console.log("[Footer Debug] No valid links found in LS (initial load)."); 
          }
      } catch (err) {
          console.error("[Footer Debug] Error setting links state (initial load):", err); 
          setErrorLoadingLinks("Failed to load links.");
          setFooterLinks([]);
      } finally {
          console.log("[Footer Debug] Reached finally block (initial load), setting isLoadingLinks to false."); 
          setIsLoadingLinks(false); 
      }
      
      // Storage listener setup
      const handleStorageChange = (event: StorageEvent) => {
         if (event.key === LOCAL_STORAGE_KEY) {
             console.log("[Footer Debug] Storage change detected, reloading links...");
             setIsLoadingLinks(true); 
             try {
                 const links = getLinksFromLS();
                 setFooterLinks(links || []); // Update state with new links (already filtered)
                 console.log("[Footer Debug] Links updated from storage change.");
             } catch (err) {
                  console.error("[Footer Debug] Error handling storage change:", err);
                  setErrorLoadingLinks("Failed to reload links after change.");
             } finally {
                   console.log("[Footer Debug] Reached finally block in storage listener, setting isLoadingLinks to false.");
                   setIsLoadingLinks(false);
             }
         }
      };
      
      if (typeof window !== 'undefined') {
          window.addEventListener('storage', handleStorageChange);
      }
      
      return () => {
           if (typeof window !== 'undefined') {
               console.log("[Footer Debug] Cleaning up footer listener.");
               window.removeEventListener('storage', handleStorageChange)
           }
       };

  }, []); // Run only on mount

  // Filter links based on the local state 'footerLinks'
  const socialMediaLinks = footerLinks.filter(link => link.category === 'social' || !link.category);
  const businessLinks = footerLinks.filter(link => link.category === 'business');
  const otherLinks = footerLinks.filter(link => link.category === 'other');

  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2">
          <Image 
            src="/icons/icon-512x512.png" 
            alt="Nodus Payment Hub Logo" 
            width={44}
            height={44}
            className="h-20 w-20"
          />
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            {/* Optional: Add a link to privacy policy or terms */}
            {/* <Link
              href="/privacy"
              className="font-medium underline underline-offset-4 ml-2"
            >
              Privacy Policy
            </Link> */}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Use local state for loading/error/rendering */}
          {isLoadingLinks ? (
            <span className="text-sm text-muted-foreground animate-pulse">Loading links...</span>
          ) : errorLoadingLinks ? (
            <span className="text-sm text-destructive">{errorLoadingLinks}</span>
          ) : footerLinks.length === 0 ? (
              <span className="text-sm text-muted-foreground">No links configured.</span>
          ) : (
            <>
              {/* Render links from local state */}
              {socialMediaLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                  aria-label={link.name}
                >
                  {link.name}
                </Link>
              ))}
              
              {businessLinks.map((link) => (
                 <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                  aria-label={link.name}
                >
                  {link.name}
                </Link>
              ))}
              
              {otherLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                  aria-label={link.name}
                >
                  {link.name}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </footer>
  );
} 