output_style = :expanded

module Sass::Script::Functions
  def random(max = Sass::Script::Number.new(1000))
    Sass::Script::Number.new(rand(max.value), max.numerator_units, max.denominator_units)
  end
end