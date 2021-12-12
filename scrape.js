const observer = new MutationObserver(mutationList => {
	mutationList.forEach(({ addedNodes }) => {
		addedNodes.forEach(node => {
			if (!/^drop_/.test(node.id)) {
				return true;
			}

			const artist = getValueByClass(node, 'col_artist');
			const track = getValueByClass(node, 'col_song_title');
			const album = getValueByClass(node, 'col_album_title');
			console.log('NEW!', { artist, track, album });
		});
	});
});

const dropTable = document.querySelector('#drop_table tbody');

observer.observe(dropTable, {
	childList: true,
});

function getValueByClass(node, klass) {
	const child = Array.prototype.find.call(node.children, child => {
		return child.classList.contains(klass);
	});

	return child?.children?.[0]?.innerText;
}
