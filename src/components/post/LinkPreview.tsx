import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Icons } from '../../assets/icons';

interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  domain: string;
}

interface LinkPreviewProps {
  url: string;
  onRemove?: () => void;
  showRemove?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Proxy chain — tried one by one until HTML is received
// ─────────────────────────────────────────────────────────────────────────────
const PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`,
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const extractDomain = (url: string): string => {
  try {
    const m = url.match(/^https?:\/\/([^/?#]+)/i);
    return (m?.[1] || '').replace(/^www\./, '');
  } catch {
    return '';
  }
};

const extractSiteName = (domain: string): string => {
  const parts = domain.split('.');
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || '';
};

const getFaviconUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;

const decodeHtml = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)));

const getMeta = (html: string, patterns: RegExp[]): string => {
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return '';
};

const parseOgMeta = (html: string, url: string): Omit<LinkPreview, 'url'> => {
  const domain = extractDomain(url);
  const siteName = extractSiteName(domain);

  const title = getMeta(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);

  const description = getMeta(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
  ]);

  let image = getMeta(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]);

  // Fix relative image URLs
  if (image && image.startsWith('/')) {
    const origin = url.match(/^(https?:\/\/[^/?#]+)/i)?.[1] || '';
    image = origin + image;
  }

  const rawSiteName = getMeta(html, [
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i,
  ]);

  return {
    title: decodeHtml(title) || siteName.charAt(0).toUpperCase() + siteName.slice(1),
    description: decodeHtml(description),
    image,
    siteName: decodeHtml(rawSiteName) || siteName,
    domain,
  };
};

const fetchWithProxies = async (url: string): Promise<string> => {
  let lastError: any;
  for (const buildProxy of PROXIES) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(buildProxy(url), { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const html = await res.text();
      if (html.length < 200 || !html.includes('<')) continue;
      return html;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All proxies failed');
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const LinkPreviewComponent: React.FC<LinkPreviewProps> = ({ url, onRemove, showRemove = true }) => {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const fetchLinkPreview = useCallback(async () => {
    setLoading(true);
    setImageError(false);

    const domain = extractDomain(url);
    const siteName = extractSiteName(domain);

    const fallback: LinkPreview = {
      url,
      title: siteName.charAt(0).toUpperCase() + siteName.slice(1) || 'Link',
      description: '',
      image: '',
      siteName,
      domain,
    };

    try {
      const html = await fetchWithProxies(url);
      const meta = parseOgMeta(html, url);
      setPreview({ url, ...meta });
    } catch {
      setPreview(fallback);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchLinkPreview();
  }, [fetchLinkPreview]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.loadingCard}>
          {/* Left grey bar */}
          <View style={styles.accentBar} />
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 10 }} />
          <Text style={styles.loadingText}>Loading preview…</Text>
        </View>
      </View>
    );
  }

  if (!preview) return null;

  const showImage = !!preview.image && !imageError;

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>

        {/* LEFT green accent bar */}

        {/* Thumbnail — left side, square */}
        {showImage && (
          <Image
            source={{ uri: preview.image }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}

        {/* Text content — fills remaining space */}
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {preview.title}
          </Text>

          {!!preview.description && (
            <Text style={styles.description} numberOfLines={2}>
              {preview.description}
            </Text>
          )}

          {/* Domain row with favicon */}
          <View style={styles.domainRow}>
            <Image
              source={{ uri: getFaviconUrl(preview.domain) }}
              style={styles.favicon}
              onError={() => { }}
            />
            <Text style={styles.domainText} numberOfLines={1}>
              {preview.domain}
            </Text>
          </View>
        </View>

        {/* Close / remove button — top right */}
        {showRemove && <TouchableOpacity
          style={styles.removeBtn}
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Image source={Icons.cross} style={styles.removeIcon} />
        </TouchableOpacity>}

      </View>
    </View>
  );
};

export default LinkPreviewComponent;

// ─────────────────────────────────────────────────────────────────────────────
// Styles — pixel-matched to WhatsApp link preview
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    marginBottom: 4,
  },

  // ── Loading card ──────────────────────────────────────────────────────────
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingRight: 12,
    gap: 8,
  },
  loadingText: {
    ...Typography.black12Regular,
    color: Colors.secondaryText,
  },

  // ── Main card ─────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#F0F2F5',   // WhatsApp light grey bg
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 80,
  },

  // Green left accent bar (WhatsApp signature ~3-4px wide)
  accentBar: {
    width: 4,
    backgroundColor: Colors.primary || '#25D366',
  },

  // Left thumbnail — square, same height as card
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#D1D5DB',
  },

  // Right text block
  textBlock: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    gap: 2,
    // Leave space for the X button
    paddingRight: 32,
  },

  title: {
    ...Typography.black13Bold,
    fontSize: 13,
    lineHeight: 18,
  },

  description: {
    ...Typography.black12Regular,
    color: Colors.secondaryText,
    lineHeight: 16,
  },

  // Favicon + domain
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  favicon: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  domainText: {
    ...Typography.black11Regular,
    fontSize: 11,
    color: Colors.secondaryText,
    flex: 1,
  },

  // X button — top right corner inside card
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: 10,
    height: 10,
    tintColor: '#374151',
  },
});