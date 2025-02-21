function generateUniqueNo(sequence_start, no_of_digit) {
  let unique = [];

  let itrunique = {
    next() {
      let random_no = Math.random() * 10;
      let get_first_digit = String(random_no).split(".")[0];
      let result;
      if (Number(get_first_digit) === sequence_start && unique.length < 1) {
        unique.push(get_first_digit);
        result = { value: unique, done: false };
        return result;
      } else if (unique.length === no_of_digit) {
        result = { value: unique, done: true };
        return;
      } else {
        if (unique.length > 0) {
          unique.push(get_first_digit);
        }
        result = { value: unique, done: false };
        return result;
      }
    },
  };
  return itrunique;
}

async function generateNumber(start_with, no_of_digit) {
  let it = generateUniqueNo(start_with, no_of_digit);

  return new Promise((resolve, reject) => {
    let result = it.next();
    let finalotp = 0;

    while (!result.done && result.value.length != no_of_digit) {
      finalotp = result.value;
      result = it.next();
    }

    resolve(String(finalotp).replaceAll(',',''));
  });
}

module.exports = generateNumber;
