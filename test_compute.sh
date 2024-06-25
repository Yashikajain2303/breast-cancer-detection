echo "Spawning 4 processes"
for i in {1..4} ;
do
    python models_backend/densemass/densemass.py &    
done
wait


