const configuredSiteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
const configuredContactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();

export const siteConfig = {
  name: configuredSiteName && configuredSiteName.length > 0 ? configuredSiteName : '스피드 통신',
  contactPhone:
    configuredContactPhone && configuredContactPhone.length > 0
      ? configuredContactPhone
      : '010-1234-5678',
};

export const contactPhoneHref = `tel:${siteConfig.contactPhone.replace(/[^0-9+]/g, '')}`;
