<?php

namespace League\Uri;

use Psr\Http\Message\UriInterface as PsrUriInterface;

/**
 * Minimal Http class for Readability compatibility
 * Based on league/uri 6.x
 */
class Http implements PsrUriInterface
{
    private $uri;
    
    private function __construct($uri) {
        $this->uri = $uri;
    }
    
    public static function createFromString($uri = '') {
        return new self(Uri::createFromString($uri));
    }
    
    public function getScheme() {
        return $this->uri->getScheme();
    }
    
    public function getHost() {
        return $this->uri->getHost();
    }
    
    public function getPort() {
        return $this->uri->getPort();
    }
    
    public function getPath() {
        return $this->uri->getPath();
    }
    
    public function getQuery() {
        return $this->uri->getQuery();
    }
    
    public function getFragment() {
        return $this->uri->getFragment();
    }
    
    public function getUserInfo() {
        return $this->uri->getUserInfo();
    }
    
    public function withScheme($scheme) {
        return new self($this->uri->withScheme($scheme));
    }
    
    public function withUserInfo($user, $password = null) {
        return new self($this->uri->withUserInfo($user, $password));
    }
    
    public function withHost($host) {
        return new self($this->uri->withHost($host));
    }
    
    public function withPort($port) {
        return new self($this->uri->withPort($port));
    }
    
    public function withPath($path) {
        return new self($this->uri->withPath($path));
    }
    
    public function withQuery($query) {
        return new self($this->uri->withQuery($query));
    }
    
    public function withFragment($fragment) {
        return new self($this->uri->withFragment($fragment));
    }
    
    public function __toString() {
        return (string) $this->uri;
    }
}