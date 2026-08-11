'use client';

import { useEffect } from 'react';

export function GoogleTranslateLoader() {
  useEffect(() => {
    // Load Google Translate script dynamically
    const id = 'google-translate-script';
    if (!document.getElementById(id)) {
      const addScript = document.createElement('script');
      addScript.setAttribute('src', 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
      addScript.setAttribute('id', id);
      document.body.appendChild(addScript);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    }
  }, []);

  return (
    <>
      {/* Hidden container required by Google Translate */}
      <div id="google_translate_element" style={{ display: 'none' }} />
      <style dangerouslySetInnerHTML={{ __html: `
        .skiptranslate, iframe.skiptranslate, .goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
      ` }} />
    </>
  );
}
