import { selectTeamGreedy } from '../utils/teamSelection';

async function main() {
  const team = await selectTeamGreedy(
    ['torrenegra'],
    ['leadership', 'entrepreneurship', 'product-management'],
    1
  );
  console.log(JSON.stringify(team, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
