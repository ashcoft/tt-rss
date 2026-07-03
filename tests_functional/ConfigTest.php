<?php
use PHPUnit\Framework\TestCase;

final class ConfigTest extends TestCase {
    public function test_self_url_a(): void {
        $_SERVER = [];

        $_SERVER["HTTP_X_FORWARDED_PROTO"] = "http";
        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/tt-rss/api/index.php";

        $this->assertEquals(
            'http://example.com/tt-rss',
            Config::get_self_url(true)
        );

    }

    public function test_self_url_b(): void {
        $_SERVER = [];

        $_SERVER["HTTP_X_FORWARDED_PROTO"] = "https";
        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/api/";

        $this->assertEquals(
            'https://example.com',
            Config::get_self_url(true)
        );
    }

    public function test_self_url_c(): void {
        $_SERVER = [];

        $_SERVER["HTTP_X_FORWARDED_PROTO"] = "https";
        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/api/index.php";

        $this->assertEquals(
            'https://example.com',
            Config::get_self_url(true)
        );
    }

    public function test_self_url_d(): void {
        $_SERVER = [];

        $_SERVER["HTTP_X_FORWARDED_PROTO"] = "https";
        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/api//";

        $this->assertEquals(
            'https://example.com',
            Config::get_self_url(true)
        );
    }

    public function test_self_url_e(): void {
        $_SERVER = [];

        $_SERVER["HTTP_X_FORWARDED_PROTO"] = "https";
        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/";

        $this->assertEquals(
            'https://example.com',
            Config::get_self_url(true)
        );
    }

    public function test_self_url_f(): void {
        $_SERVER = [];

        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/tt-rss/index.php";

        $this->assertEquals(
            'http://example.com/tt-rss',
            Config::get_self_url(true)
        );
    }

    public function test_self_url_g(): void {
        $_SERVER = [];

        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/tt-rss/";

        $this->assertEquals(
            'http://example.com/tt-rss',
            Config::get_self_url(true)
        );
    }

    public function test_self_url_h(): void {
        $_SERVER = [];

        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/tt-rss";

        $this->assertEquals(
            'http://example.com/tt-rss',
            Config::get_self_url(true)
        );
    }

    public function test_self_url_i(): void {
        $_SERVER = [];

        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/tt-rss////plugins.local/example///api/long path/test.php";

        $this->assertEquals(
            'http://example.com/tt-rss',
            Config::get_self_url(true)
        );
    }

    public function test_self_url_j(): void {
        $_SERVER = [];

        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/tt-rss/plugins.local/example/api/longpath/test.php/reader/api/0/stream/items/ids?n=1000&output=json&s=user/-/state/com.google/starred";

        $this->assertEquals(
            'http://example.com/tt-rss',
            Config::get_self_url(true)
        );
    }

    public function test_self_url_k(): void {
        $_SERVER = [];

        $_SERVER["HTTP_HOST"] = "example.com";
        $_SERVER["REQUEST_URI"] = "/tt-rss/plugins/example/api/longpath/test.php/reader/api/0/stream/items/ids?n=1000&output=json&s=user/-/state/com.google/starred";

        $this->assertEquals(
            'http://example.com/tt-rss',
            Config::get_self_url(true)
        );
    }

    public function test_get_self_dir(): void {
        $this->assertEquals(
            dirname(__DIR__), # we're in (app)/tests/
            Config::get_self_dir()
        );
    }

    public function test_cast_to_int(): void {
        // basic integers
        $this->assertSame(42, Config::cast_to("42", Config::T_INT));
        $this->assertSame(0, Config::cast_to("0", Config::T_INT));
        $this->assertSame(-7, Config::cast_to("-7", Config::T_INT));

        // string coercion to int
        $this->assertSame(0, Config::cast_to("", Config::T_INT));
        $this->assertSame(123, Config::cast_to("123abc", Config::T_INT));
        $this->assertSame(0, Config::cast_to("abc", Config::T_INT));

        // float-like strings
        $this->assertSame(3, Config::cast_to("3.14", Config::T_INT));
    }

    public function test_cast_to_string(): void {
        // T_STRING is the default, value passes through unchanged
        $this->assertSame("hello", Config::cast_to("hello", Config::T_STRING));
        $this->assertSame("0", Config::cast_to("0", Config::T_STRING));
        $this->assertSame("", Config::cast_to("", Config::T_STRING));
        $this->assertSame("false", Config::cast_to("false", Config::T_STRING));
        $this->assertSame("42", Config::cast_to("42", Config::T_STRING));
    }

    public function test_cast_to_bool(): void {
        // truthy values
        $this->assertTrue(Config::cast_to("true", Config::T_BOOL));
        $this->assertTrue(Config::cast_to("1", Config::T_BOOL));
        $this->assertTrue(Config::cast_to("t", Config::T_BOOL));
        $this->assertTrue(Config::cast_to("yes", Config::T_BOOL));
        $this->assertTrue(Config::cast_to("on", Config::T_BOOL));
        $this->assertTrue(Config::cast_to("anything", Config::T_BOOL));

        // falsy values
        $this->assertFalse(Config::cast_to("false", Config::T_BOOL));
        $this->assertFalse(Config::cast_to("f", Config::T_BOOL));
        $this->assertFalse(Config::cast_to("0", Config::T_BOOL));
        $this->assertFalse(Config::cast_to("", Config::T_BOOL));
    }

    /**
     * @dataProvider matchesSelfUrlProvider
     */
    public function test_matches_self_url(string $self_url, string $input, bool $expected): void {
        Config::set(Config::SELF_URL_PATH, $self_url);
        $this->assertSame($expected, Config::matches_self_url($input));
    }

    public static function matchesSelfUrlProvider(): array {
        return [
            // Valid same-origin URLs
            ['http://example.com', 'http://example.com/', true],
            ['http://example.com', 'http://example.com/index.php', true],
            ['http://example.com', 'http://example.com/tt-rss/', true],
            ['http://example.com/tt-rss', 'http://example.com/tt-rss', true],
            ['http://example.com/tt-rss', 'http://example.com/tt-rss/index.php', true],
            ['http://example.com/tt-rss', 'http://example.com/tt-rss/feed/1', true],

            // Valid with port
            ['http://example.com:8080', 'http://example.com:8080/', true],
            ['https://example.com:8443', 'https://example.com:8443/api', true],

            // Invalid - different scheme
            ['http://example.com', 'https://example.com/', false],
            ['https://example.com', 'http://example.com/', false],

            // Invalid - different host
            ['http://example.com', 'http://evil.com/', false],
            ['http://example.com', 'http://example.com.evil.com/', false],
            ['http://example.com', 'http://user:pass@example.com/', false],

            // Invalid - different port
            ['http://example.com', 'http://example.com:8080/', false],
            ['http://example.com:8080', 'http://example.com/', false],

            // Invalid - path traversal
            ['http://example.com/tt-rss', 'http://example.com/other/', false],
            ['http://example.com/tt-rss', 'http://example.com/../admin/', false],

            // Invalid - no path prefix match
            ['http://example.com/tt-rss', 'http://example.com/tt-rsss/', false],

            // Invalid - malformed URLs
            ['http://example.com', '', false],
            ['http://example.com', '/relative', false],
            ['http://example.com', 'ftp://example.com/', false],

            // HTTPS automatic port
            ['https://example.com', 'https://example.com:443/', true],
            ['http://example.com', 'http://example.com:80/', true],
        ];
    }
}
