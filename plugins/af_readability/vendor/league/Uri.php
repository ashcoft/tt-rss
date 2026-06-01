<?php

namespace League\Uri;

use Psr\Http\Message\UriInterface as PsrUriInterface;

/**
 * Minimal Uri class for Readability compatibility
 * Based on league/uri 6.x
 */
class Uri implements PsrUriInterface
{
    private $components;
    
    private function __construct(array $components = []) {
        $this->components = $components;
    }
    
    public static function createFromString($uri = '') {
        $parsed = parse_url($uri);
        if ($parsed === false) {
            $parsed = ['path' => $uri];
        }
        return new self($parsed);
    }
    
    public static function createFromComponents(array $components) {
        return new self($components);
    }
    
    public function getScheme() {
        return $this->components['scheme'] ?? '';
    }
    
    public function getHost() {
        return $this->components['host'] ?? '';
    }
    
    public function getPort() {
        return $this->components['port'] ?? null;
    }
    
    public function getPath() {
        return $this->components['path'] ?? '';
    }
    
    public function getQuery() {
        return $this->components['query'] ?? '';
    }
    
    public function getFragment() {
        return $this->components['fragment'] ?? '';
    }
    
    public function getUserInfo() {
        $info = $this->components['user'] ?? '';
        if (isset($this->components['pass'])) {
            $info .= ':' . $this->components['pass'];
        }
        return $info;
    }
    
    public function withScheme($scheme) {
        $components = $this->components;
        $components['scheme'] = $scheme;
        return new self($components);
    }
    
    public function withUserInfo($user, $password = null) {
        $components = $this->components;
        $components['user'] = $user;
        if ($password !== null) {
            $components['pass'] = $password;
        } else {
            unset($components['pass']);
        }
        return new self($components);
    }
    
    public function withHost($host) {
        $components = $this->components;
        $components['host'] = $host;
        return new self($components);
    }
    
    public function withPort($port) {
        $components = $this->components;
        if ($port === null) {
            unset($components['port']);
        } else {
            $components['port'] = $port;
        }
        return new self($components);
    }
    
    public function withPath($path) {
        $components = $this->components;
        $components['path'] = $path;
        return new self($components);
    }
    
    public function withQuery($query) {
        $components = $this->components;
        if ($query === null) {
            unset($components['query']);
        } else {
            $components['query'] = $query;
        }
        return new self($components);
    }
    
    public function withFragment($fragment) {
        $components = $this->components;
        if ($fragment === null) {
            unset($components['fragment']);
        } else {
            $components['fragment'] = $fragment;
        }
        return new self($components);
    }
    
    public function __toString() {
        $uri = '';
        
        $scheme = $this->getScheme();
        if ($scheme !== '') {
            $uri .= $scheme . ':';
        }
        
        $host = $this->getHost();
        $user = $this->components['user'] ?? '';
        $pass = $this->components['pass'] ?? '';
        
        if ($host !== '' || $user !== '') {
            $uri .= '//';
            if ($user !== '') {
                $uri .= $user;
                if ($pass !== '') {
                    $uri .= ':' . $pass;
                }
                $uri .= '@';
            }
            $uri .= $host;
            
            $port = $this->getPort();
            if ($port !== null) {
                $uri .= ':' . $port;
            }
        }
        
        $uri .= $this->getPath();
        
        $query = $this->getQuery();
        if ($query !== '') {
            $uri .= '?' . $query;
        }
        
        $fragment = $this->getFragment();
        if ($fragment !== '') {
            $uri .= '#' . $fragment;
        }
        
        return $uri;
    }
}