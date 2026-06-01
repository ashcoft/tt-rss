<?php
// Custom autoloader for af_readability plugin
// This loads the Readability library and its dependencies

spl_autoload_register(function ($class) {
    // League\Uri namespace
    if (strpos($class, 'League\\Uri\\') === 0) {
        $file = __DIR__ . '/league/' . str_replace('\\', '/', substr($class, 12)) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return true;
        }
    }
    
    // Fivefilters Readability
    if (strpos($class, 'fivefilters\\Readability\\') === 0) {
        $file = __DIR__ . '/readability/src/' . str_replace('\\', '/', substr($class, 24)) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return true;
        }
    }
    
    // Masterminds HTML5
    if (strpos($class, 'Masterminds\\') === 0) {
        $file = __DIR__ . '/masterminds/html5/src/' . str_replace('\\', '/', substr($class, 12)) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return true;
        }
    }
    
    // PSR interfaces from main vendor
    if (strpos($class, 'Psr\\') === 0) {
        $file = __DIR__ . '/../../vendor/' . str_replace('\\', '/', $class) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return true;
        }
    }
    
    return false;
});