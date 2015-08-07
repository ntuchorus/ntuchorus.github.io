cp _site/* ../official.page.ntuchorus -r
cd ../official.page.ntuchorus 
git status
git add --all
git commit -m "Production push"
git push
