require 'nokogiri'
require 'open-uri'

def option(initial, name)
  s = "option(value='#{initial}') #{name}"
  puts s
end
def main
  main_page = Nokogiri::HTML(open('https://my.usfirst.org/myarea/index.lasso?event_type=FRC&amp;year=2014'))
  main_page.css('td a').each do |event| 
    link = "https://my.usfirst.org/myarea/index.lasso" + event['href'].to_s
    if(link=~ /\w*event_details\w*/)
      swag = Nokogiri::HTML(open link)
      event_init = ""
      event_name = "" 
      swag.css('a').each do |a| 
        a = a['href']
        if(a =~ /http:\/\/www2\.usfirst\.org\/2014comp\/Events\/[A-Z]+\/matchresults\.html/) 
          event_init = a.scan(/\w+\/Events\/([A-Z]+)\/\w+/).join("")
        end
      end
      event_name = swag.css('td b').to_s.scan(/<b>(.*)<\/b>/).join("")
      option(event_init, event_name)
    end

   # Nokogiri::HTML(open(link))
  end
end
main
