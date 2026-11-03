#!/usr/bin/perl
# Bundles app/ into one self-contained HTML file (for the pitch previews and for emailing).
#   perl bundle.pl <app dir> <output.html>
# Follows imports from src/main.js depth-first, so modules land in dependency order, then:
#   - drops local imports and the `export` keyword (all top-level names are unique across modules)
#   - turns lib/html.js's re-export from 'preact-htm' into an import (the importmap stays)
#   - inlines the stylesheets between the STYLES markers and the assets as data URIs
# Not a production bundler: engineering should switch to Vite (see README).
use strict; use warnings;
use File::Basename qw(dirname); use File::Spec; use MIME::Base64;

my ($app, $out) = @ARGV; die "usage: bundle.pl <app dir> <output.html>\n" unless $app && $out;
sub slurp { open my $fh, '<:raw', $_[0] or die "$_[0]: $!"; local $/; <$fh> }

my (%seen, @order);
sub visit {
  my $f = File::Spec->canonpath(shift);
  1 while $f =~ s{(^|/)(?!\.\.?/)[^/]+/\.\./}{$1}; # fold "dir/../" so each module has one key
  return if $seen{$f}++;
  my $src = slurp($f);
  for my $dep ($src =~ /^import\s+\{[^}]*\}\s+from\s+'(\.[^']+)';\s*$/mg) { visit(File::Spec->catfile(dirname($f), $dep)) }
  push @order, $f;
}
visit("$app/src/main.js");

my %names; my $js = '';
for my $f (@order) {
  my $src = slurp($f);
  $src =~ s/^export\s+\{([^}]*)\}\s+from\s+'preact-htm';/import {$1} from 'preact-htm';/m;
  $src =~ s/^import\s+\{[^}]*\}\s+from\s+'\.[^']+';[ \t]*\n//mg;
  $src =~ s/^export\s+(?=(?:async\s+)?(?:const|let|function|class)\b)//mg;
  die "$f: unsupported export form\n" if $src =~ /^export\b/m;
  for my $n ($src =~ /^(?:async\s+)?(?:const|let|function|class)\s+([\w\$]+)/mg) {
    die "duplicate top-level name '$n' in $f and $names{$n}\n" if $names{$n}; $names{$n} = $f;
  }
  (my $rel = $f) =~ s/^\Q$app\E\/?//;
  $js .= "// ---- $rel\n$src\n";
}
die "a module contains </script>\n" if $js =~ m{</script}i;

my $html = slurp("$app/index.html");
my ($styles) = $html =~ /<!-- STYLES -->(.*?)<!-- \/STYLES -->/s or die "no STYLES markers\n";
my $css = join "\n", map { "/* ---- $_ */\n" . slurp("$app/$_") } $styles =~ /href="([^"]+)"/g;
$html =~ s/<!-- STYLES -->.*?<!-- \/STYLES -->/<style>\n$css\n<\/style>/s;
$html =~ s/<!-- SCRIPTS -->.*?<!-- \/SCRIPTS -->/<script type="module">\n$js<\/script>/s;
$html =~ s{(['"(])assets/([\w.-]+\.png)}{$1 . 'data:image/png;base64,' . encode_base64(slurp("$app/assets/$2"), '')}ge;

open my $o, '>:raw', $out or die "$out: $!"; print $o $html; close $o;
printf "bundled %d modules, %d KB -> %s\n", scalar @order, (-s $out) / 1024, $out;
