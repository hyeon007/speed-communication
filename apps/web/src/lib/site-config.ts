const configuredSiteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
const configuredContactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();

export const siteConfig = {
  name: configuredSiteName && configuredSiteName.length > 0 ? configuredSiteName : '스피드 통신',
  // Empty until the store has a phone line; phone links and "call us" copy are hidden then.
  contactPhone: configuredContactPhone ?? '',
};

export const contactPhoneHref = siteConfig.contactPhone
  ? `tel:${siteConfig.contactPhone.replace(/[^0-9+]/g, '')}`
  : '';
