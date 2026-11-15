#!/usr/bin/env ruby
require 'webrick'

# Custom WEBrick server avoiding kernel sendfile(2) to ensure compatibility
# with sandboxed environments, all modern web browsers, and localhost.
root = File.expand_path(File.dirname(__FILE__))
port = (ENV['PORT'] || 8080).to_i

server = WEBrick::HTTPServer.new(
  Port: port,
  BindAddress: '0.0.0.0',
  Logger: WEBrick::Log.new($stdout, WEBrick::Log::INFO),
  AccessLog: [[$stdout, WEBrick::AccessLog::COMBINED_LOG_FORMAT]]
)

mime_types = {
  '.html' => 'text/html; charset=utf-8',
  '.htm'  => 'text/html; charset=utf-8',
  '.js'   => 'application/javascript; charset=utf-8',
  '.jsx'  => 'application/javascript; charset=utf-8',
  '.css'  => 'text/css; charset=utf-8',
  '.json' => 'application/json; charset=utf-8',
  '.png'  => 'image/png',
  '.jpg'  => 'image/jpeg',
  '.svg'  => 'image/svg+xml',
  '.txt'  => 'text/plain; charset=utf-8'
}

server.mount_proc '/' do |req, res|
  # Allow all browsers and cross-origin access
  res['Access-Control-Allow-Origin'] = '*'
  res['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  res['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

  if req.request_method == 'OPTIONS'
    res.status = 204
    next
  end

  rel_path = req.path == '/' ? 'index.html' : req.path.sub(%r{^/}, '')
  file_path = File.join(root, rel_path)

  # Check if index.html should be served
  if File.directory?(file_path)
    file_path = File.join(file_path, 'index.html')
  end

  if File.file?(file_path)
    ext = File.extname(file_path).downcase
    res['Content-Type'] = mime_types[ext] || 'text/plain; charset=utf-8'
    # Read entire content into memory string so WEBrick uses standard socket.write
    # and never triggers kernel sendfile(2) syscall which is restricted
    res.body = File.read(file_path, mode: 'rb')
    res.status = 200
  else
    # Fallback to root index.html for client-side routing
    index_path = File.join(root, 'index.html')
    if File.file?(index_path)
      res['Content-Type'] = 'text/html; charset=utf-8'
      res.body = File.read(index_path, mode: 'rb')
      res.status = 200
    else
      res.status = 404
      res.body = "File not found"
    end
  end
end

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }

puts "==========================================================="
puts "  GCTP Web Server for All Web Browsers"
puts "  Listening on: http://localhost:#{port} and http://0.0.0.0:#{port}"
puts "==========================================================="

server.start
