<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>সকল ছাত্র-ছাত্রীর তালিকা</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: auto; }
        h1, h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>

<div class="container">
    <h1>ছাত্র-ছাত্রীদের তালিকা</h1>

    <?php
    // ১. students.json ফাইল থেকে ডেটা পড়া
    $jsonData = file_get_contents('students.json');
    // ২. JSON ডেটাকে PHP অ্যারেতে রূপান্তর করা
    $allClasses = json_decode($jsonData, true);

    // ৩. প্রতিটি ক্লাসের জন্য আলাদা টেবিল তৈরি করা
    if ($allClasses) {
        foreach ($allClasses as $className => $students) {
            echo "<h2>" . htmlspecialchars($className) . "</h2>";
            
            if (!empty($students)) {
                echo "<table>";
                echo "<tr><th>রোল</th><th>নাম</th></tr>";
                
                // ৪. প্রতিটি ছাত্রের জন্য টেবিলের সারি তৈরি করা
                foreach ($students as $student) {
                    echo "<tr>";
                    echo "<td>" . htmlspecialchars($student['roll']) . "</td>";
                    echo "<td>" . htmlspecialchars($student['name']) . "</td>";
                    echo "</tr>";
                }
                
                echo "</table>";
            } else {
                echo "<p>এই ক্লাসে কোনো ছাত্র-ছাত্রী পাওয়া যায়নি।</p>";
            }
        }
    } else {
        echo "<p>দুঃখিত, কোনো তথ্য পাওয়া যায়নি।</p>";
    }
    ?>
</div>

</body>
</html>