function durationSerializer(input) {
    const units = ["s", "m", "h", "d", "w", "mo", "y", "de"];
    const regex = RegExp(`(\\d+)(${units.join("|")})`, "g");
    const matches = Array.from(input.matchAll(regex));
    let output = 0;
    for (const match of matches) {
        const [, amount, unit] = match;
        const conversion = [1, 60, 3600, 86400, 604800, 2419200, 29030400, 290304000][units.indexOf(unit)];
        output += amount * conversion;
    }
    return output;
}

function durationDeserializer(input) {
    const units = ["de", 290304000, "y", 29030400, "mo", 2419200, "w", 604800, "d", 86400, "h", 3600, "m", 60, "s", 1];
    let output = "";

    for (let i = 0; i < units.length / 2; i++) {
        const unit = units[i * 2],
            divisor = units[(i * 2) + 1];

        if (input / divisor >= 1) {
            output += ` ${Math.floor(input / divisor)}${unit}`;
            input -= Math.floor(input / divisor) * divisor;
        }
    }

    return output.trim();
}

module.exports = {
    durationDeserializer,
    durationSerializer
}