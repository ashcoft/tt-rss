<?php

namespace League\Uri;

/**
 * Minimal UriResolver class for Readability compatibility
 * Based on league/uri 6.x
 */
class UriResolver
{
    /**
     * Resolve a relative URI against a base URI
     */
    public static function resolve($relative, $base) {
        if (!($relative instanceof Http)) {
            $relative = Http::createFromString((string)$relative);
        }
        if (!($base instanceof Http)) {
            $base = Http::createFromString((string)$base);
        }
        
        $baseScheme = $base->getScheme();
        $baseHost = $base->getHost();
        
        // If relative has scheme, return it as-is
        if ($relative->getScheme() !== '') {
            return $relative->withUserInfo($relative->getUserInfo())->withHost($relative->getHost());
        }
        
        // Determine scheme and authority
        if ($relative->getHost() !== '') {
            $target = $relative;
        } else {
            if ($relative->getPath() === '') {
                $target = $base->withPath($base->getPath());
            } elseif (strpos($relative->getPath(), '/') === 0) {
                $target = $base->withPath($relative->getPath());
            } else {
                $path = dirname($base->getPath());
                if ($path === '.') $path = '/';
                $target = $base->withPath(rtrim($path, '/') . '/' . $relative->getPath());
            }
            $target = $target->withUserInfo($base->getUserInfo())->withHost($base->getHost());
        }
        
        // Apply scheme and authority from base if not set
        if ($target->getScheme() === '' && $target->getHost() === '') {
            $target = $target->withScheme($baseScheme)->withHost($baseHost);
        }
        
        // Remove dot segments
        $path = $target->getPath();
        if (strpos($path, '/.') !== false) {
            $path = preg_replace('/\/\.\//', '/', $path);
            $path = preg_replace('/\/\.\.$/', '', $path);
            $path = preg_replace('/^\.\//', '', $path);
            $path = preg_replace('/^\.\.$/', '', $path);
            $target = $target->withPath($path);
        }
        
        return $target;
    }
}